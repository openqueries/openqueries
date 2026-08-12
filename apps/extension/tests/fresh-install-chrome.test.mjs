import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, mkdtemp, readdir, rm } from "node:fs/promises";
import net from "node:net";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";

const sleep = (milliseconds) =>
  new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds));

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolveListen) =>
    server.listen(0, "127.0.0.1", resolveListen),
  );
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const { port } = address;
  await new Promise((resolveClose) => server.close(resolveClose));
  return port;
}

async function chromeBinary() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  if (process.platform === "darwin") {
    const cache = join(homedir(), "Library/Caches/ms-playwright");
    const versions = (await readdir(cache))
      .filter((entry) => entry.startsWith("chromium-"))
      .sort()
      .reverse();
    for (const version of versions) {
      for (const architecture of ["chrome-mac-arm64", "chrome-mac"]) {
        const candidate = join(
          cache,
          version,
          architecture,
          "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
        );
        try {
          await access(candidate);
          return candidate;
        } catch {
          // Try the next installed Chrome for Testing build.
        }
      }
    }
    throw new Error(
      "Chrome for Testing is required because branded Chrome blocks unpacked extension flags",
    );
  }
  return "/usr/bin/google-chrome-for-testing";
}

async function eventually(operation, message, attempts = 100) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const result = await operation();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await sleep(100);
  }
  throw new Error(message, { cause: lastError });
}

class CdpSession {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.ready = new Promise((resolveReady, rejectReady) => {
      this.socket.addEventListener("open", resolveReady, { once: true });
      this.socket.addEventListener("error", rejectReady, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      for (const listener of this.listeners.get(message.method) ?? []) {
        void listener(message.params);
      }
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const response = new Promise((resolveResponse, rejectResponse) => {
      this.pending.set(id, {
        resolve: resolveResponse,
        reject: rejectResponse,
      });
    });
    this.socket.send(JSON.stringify({ id, method, params }));
    return response;
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  close() {
    this.socket.close();
  }
}

async function json(port, path, init) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, init);
  if (!response.ok)
    throw new Error(`Chrome debugger returned ${response.status}`);
  return response.json();
}

async function targets(port) {
  return json(port, "/json/list");
}

async function newTarget(port, url) {
  return json(port, `/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
}

async function evaluate(session, expression) {
  const result = await session.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text ??
        "Evaluation failed",
    );
  }
  return result.result?.value;
}

async function exerciseProvider(port, platform, query) {
  const origin =
    platform === "chatgpt" ? "https://chatgpt.com" : "https://claude.ai";
  const target = await newTarget(port, "about:blank");
  const session = new CdpSession(target.webSocketDebuggerUrl);
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  await session.send("Fetch.enable", {
    patterns: [{ urlPattern: `${origin}/*`, requestStage: "Request" }],
  });
  session.on("Fetch.requestPaused", async ({ requestId, request }) => {
    const isPage = request.url === `${origin}/`;
    const body = isPage
      ? "<!doctype html><html lang='en'><body>provider test</body></html>"
      : JSON.stringify({
          type: "web_search",
          search_queries: [query],
        });
    await session.send("Fetch.fulfillRequest", {
      requestId,
      responseCode: 200,
      responseHeaders: [
        {
          name: "content-type",
          value: isPage ? "text/html; charset=utf-8" : "application/json",
        },
      ],
      body: Buffer.from(body).toString("base64"),
    });
  });
  await session.send("Page.navigate", { url: `${origin}/` });
  await eventually(
    async () =>
      (await evaluate(
        session,
        `document.readyState === "complete" && Boolean(document.body)`,
      )) === true,
    `${platform} test page did not load`,
  );
  await evaluate(
    session,
    `fetch(${JSON.stringify(`${origin}/api/openqueries-test`)}).then(response => response.text())`,
  );
  session.close();
}

async function findOpenQueriesRuntime(port) {
  const extensionTargets = (await targets(port))
    .filter((target) => target.url.startsWith("chrome-extension://"))
    .sort((left, right) => {
      const leftPage = left.type === "page" ? 0 : 1;
      const rightPage = right.type === "page" ? 0 : 1;
      return leftPage - rightPage;
    });
  for (const target of extensionTargets) {
    const session = new CdpSession(target.webSocketDebuggerUrl);
    try {
      await session.send("Runtime.enable");
      const name = await evaluate(
        session,
        `typeof chrome !== "undefined" && chrome.runtime ? chrome.runtime.getManifest().name : ""`,
      );
      if (name === "Open Queries – AI Search Query Inspector") {
        return { target, session };
      }
    } catch {
      // Ignore unrelated extension targets without an extension runtime.
    }
    session.close();
  }
  return null;
}

const buildDirectory = resolve(process.cwd(), "build/chrome-mv3-prod");
const profileDirectory = await mkdtemp(join(tmpdir(), "openqueries-chrome-"));
const port = await availablePort();
const chromeExecutable = await chromeBinary();
const chromeArguments = [
  "--no-first-run",
  "--no-default-browser-check",
  "--password-store=basic",
  "--use-mock-keychain",
  "--host-resolver-rules=MAP openqueries.org ~NOTFOUND",
  "--window-position=-10000,-10000",
  "--window-size=800,600",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDirectory}`,
  `--disable-extensions-except=${buildDirectory}`,
  `--load-extension=${buildDirectory}`,
  "about:blank",
];
const chrome = spawn(
  process.platform === "linux" ? "xvfb-run" : chromeExecutable,
  process.platform === "linux"
    ? ["-a", chromeExecutable, ...chromeArguments]
    : chromeArguments,
  { stdio: ["ignore", "ignore", "pipe"] },
);

let chromeError = "";
chrome.stderr.setEncoding("utf8");
chrome.stderr.on("data", (chunk) => {
  chromeError += chunk;
});

try {
  await eventually(async () => {
    const version = await json(port, "/json/version");
    return version.Browser;
  }, `Fresh Chrome did not start: ${chromeError}`);

  const installedExtension = await eventually(
    async () => findOpenQueriesRuntime(port),
    "Fresh Chrome did not load the unpacked extension",
  );
  const installedExtensionTarget = installedExtension.target;
  const extensionId = new URL(installedExtensionTarget.url).host;
  installedExtension.session.close();
  const extensionPageTarget = await newTarget(
    port,
    `chrome-extension://${extensionId}/options.html`,
  );
  const extension = new CdpSession(extensionPageTarget.webSocketDebuggerUrl);
  await extension.send("Runtime.enable");
  await eventually(
    async () =>
      evaluate(
        extension,
        `location.protocol === "chrome-extension:" && typeof chrome !== "undefined" && Boolean(chrome.runtime)`,
      ),
    "Fresh-install extension page did not initialize",
  );

  const initial = await eventually(
    async () =>
      evaluate(
        extension,
        `chrome.runtime.sendMessage({type:"openqueries:get-state"})`,
      ),
    "Fresh-install service worker did not accept runtime messages",
  );
  assert.equal(initial.ok, true);
  assert.equal(initial.state.privacyAccepted, false);

  const historyTarget = await newTarget(
    port,
    `chrome-extension://${extensionId}/sidepanel.html`,
  );
  const history = new CdpSession(historyTarget.webSocketDebuggerUrl);
  await history.send("Runtime.enable");
  await eventually(async () => {
    const text = await evaluate(history, "document.body?.innerText || ''");
    if (!text.includes("Open a supported site"))
      throw new Error(`Side panel text: ${JSON.stringify(text)}`);
    return true;
  }, "Fresh-install side panel did not render its unsupported-site state");
  await eventually(async () => {
    await evaluate(
      history,
      `[...document.querySelectorAll("button")].find(button => button.textContent?.trim() === "Settings")?.click()`,
    );
    return (
      (await evaluate(history, "document.querySelector('h1')?.textContent")) ===
      "You control the trace."
    );
  }, "Fresh-install side panel could not navigate to Settings");
  const privacyClicked = await evaluate(
    history,
    `(() => {
      const control = document.querySelector('[role="switch"][aria-label="Accept privacy settings"]');
      if (!(control instanceof HTMLElement) || control.getAttribute("aria-checked") !== "false") return false;
      control.click();
      return true;
    })()`,
  );
  assert.equal(privacyClicked, true);
  await eventually(async () => {
    const state = await evaluate(
      extension,
      `chrome.runtime.sendMessage({type:"openqueries:get-state"})`,
    );
    return state.ok && state.state.privacyAccepted;
  }, "Fresh-install privacy control did not update extension state");

  const expected = {
    chatgpt: "fresh install ChatGPT transport query",
    claude: "fresh install Claude transport query",
  };
  await exerciseProvider(port, "chatgpt", expected.chatgpt);
  await exerciseProvider(port, "claude", expected.claude);

  const captured = await eventually(async () => {
    const state = await evaluate(
      extension,
      `chrome.runtime.sendMessage({type:"openqueries:get-state"})`,
    );
    const queries = new Set(state.state.events.map((event) => event.query));
    return Object.values(expected).every((query) => queries.has(query))
      ? state
      : null;
  }, "Fresh install did not capture both ChatGPT and Claude transport queries");
  assert.equal(captured.state.events.length, 2);

  await eventually(async () => {
    await evaluate(
      history,
      `[...document.querySelectorAll("button")].find(button => button.textContent?.trim() === "History")?.click()`,
    );
    return (
      (await evaluate(history, "document.querySelector('h1')?.textContent")) ===
      "History"
    );
  }, "Fresh-install side panel could not navigate to History");
  const historyText = await eventually(async () => {
    const text = await evaluate(history, "document.body.innerText");
    return Object.values(expected).every((query) => text.includes(query))
      ? text
      : null;
  }, "Fresh-install History did not display both provider queries");
  assert.match(historyText, /fresh install ChatGPT transport query/u);
  assert.match(historyText, /fresh install Claude transport query/u);

  history.close();
  extension.close();
  console.log(
    `Fresh Chrome install ${extensionId} captured and displayed ChatGPT and Claude transport queries.`,
  );
} finally {
  chrome.kill("SIGTERM");
  await new Promise((resolveExit) => chrome.once("exit", resolveExit));
  await rm(profileDirectory, { recursive: true, force: true });
}
