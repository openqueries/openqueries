import type { Platform } from "@openqueries/contracts";

import {
  extractSearchQueriesFromTransport,
  takeCompleteSseFrames,
} from "./provider-stream";
import { createChatGptConversationSync } from "./chatgpt-conversation-sync";

const CHANNEL = "openqueries:provider-query:v1";
const MAX_BUFFER_LENGTH = 2_000_000;

type TransportWindow = Window & {
  __openQueriesTransportObservers?: Partial<Record<Platform, true>>;
};

export function installProviderTransportObserver(platform: Platform): void {
  const transportWindow = window as TransportWindow;
  const installed = (transportWindow.__openQueriesTransportObservers ??= {});
  if (installed[platform]) return;
  installed[platform] = true;

  const publish = (query: string): void => {
    window.postMessage(
      { channel: CHANNEL, platform, query },
      window.location.origin,
    );
  };

  const inspect = (text: string): void => {
    const queries = extractSearchQueriesFromTransport(text);
    for (const query of queries) publish(query);
  };

  const inspectMessageData = async (data: unknown): Promise<void> => {
    if (typeof data === "string") {
      inspect(data);
      return;
    }
    if (data instanceof Blob) {
      inspect(await data.text());
      return;
    }
    if (data instanceof ArrayBuffer) {
      inspect(new TextDecoder().decode(data));
    }
  };

  const inspectEventStream = async (response: Response): Promise<void> => {
    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let buffer = "";
    let transcript = "";

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const complete = takeCompleteSseFrames(buffer);
      buffer = complete.remainder;
      if (complete.frames.length) {
        transcript += `${complete.frames.join("\n\n")}\n\n`;
        inspect(transcript);
        if (transcript.length > MAX_BUFFER_LENGTH)
          transcript = transcript.slice(-MAX_BUFFER_LENGTH / 2);
      }
      if (done) break;
      if (buffer.length > MAX_BUFFER_LENGTH)
        buffer = buffer.slice(-MAX_BUFFER_LENGTH / 2);
    }

    if (buffer.trim()) inspect(`${transcript}${buffer}`);
  };

  const nativeFetch = window.fetch.bind(window);
  const chatGptSync =
    platform === "chatgpt"
      ? createChatGptConversationSync(nativeFetch, inspect)
      : null;

  const inspectResponse = async (response: Response): Promise<void> => {
    const contentType = response.headers.get("content-type") ?? "";
    if (!/(?:json|text|event-stream)/iu.test(contentType)) return;
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BUFFER_LENGTH) return;
    try {
      if (/event-stream/iu.test(contentType)) {
        await inspectEventStream(response);
        return;
      }
      inspect(await response.text());
    } catch {
      // The provider page's original response is never touched.
    } finally {
      chatGptSync?.reconcileAfterNetworkActivity();
    }
  };

  window.fetch = async (...input) => {
    const replayableRequest = chatGptSync?.cloneRequest(input) ?? null;
    const response = await nativeFetch(...input);
    chatGptSync?.rememberProviderRequest(replayableRequest, response);
    try {
      void inspectResponse(response.clone());
    } catch {
      // Non-cloneable responses remain untouched.
    }
    return response;
  };

  const nativeOpen = XMLHttpRequest.prototype.open;
  const nativeSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    ...rest: unknown[]
  ): void {
    return Reflect.apply(nativeOpen, this, [method, url, ...rest]);
  };
  XMLHttpRequest.prototype.send = function (...args: unknown[]): void {
    this.addEventListener(
      "load",
      () => {
        if (this.responseType !== "" && this.responseType !== "text") return;
        const contentType = this.getResponseHeader("content-type") ?? "";
        if (!/(?:json|text|event-stream)/iu.test(contentType)) return;
        try {
          inspect(this.responseText);
        } catch {
          // Ignore response modes that do not expose text.
        }
      },
      { once: true },
    );
    return Reflect.apply(nativeSend, this, args);
  };

  if (window.EventSource) {
    const NativeEventSource = window.EventSource;
    const ObservedEventSource = new Proxy(NativeEventSource, {
      construct(Target, args, NewTarget) {
        const source = Reflect.construct(
          Target,
          args,
          NewTarget,
        ) as EventSource;
        source.addEventListener("message", (event) => inspect(event.data));
        return source;
      },
    });
    Object.defineProperty(window, "EventSource", {
      configurable: true,
      writable: true,
      value: ObservedEventSource,
    });
  }

  if (window.WebSocket) {
    const NativeWebSocket = window.WebSocket;
    const ObservedWebSocket = new Proxy(NativeWebSocket, {
      construct(Target, args, NewTarget) {
        const socket = Reflect.construct(Target, args, NewTarget) as WebSocket;
        socket.addEventListener("message", (event) => {
          void inspectMessageData(event.data).catch(() => undefined);
        });
        return socket;
      },
    });
    Object.defineProperty(window, "WebSocket", {
      configurable: true,
      writable: true,
      value: ObservedWebSocket,
    });
  }
}
