import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

import {
  chatGptConversationUrl,
  createChatGptConversationSync,
} from "../lib/chatgpt-conversation-sync";

test("derives the snapshot endpoint only from the active ChatGPT conversation route", () => {
  const conversation = new JSDOM("", {
    url: "https://chatgpt.com/c/WEB:4b1e73e1-4f82-4924-b907-591569df2a21",
  });
  assert.equal(
    chatGptConversationUrl(conversation.window.location),
    "https://chatgpt.com/backend-api/conversation/WEB%3A4b1e73e1-4f82-4924-b907-591569df2a21",
  );

  const home = new JSDOM("", { url: "https://chatgpt.com/" });
  assert.equal(chatGptConversationUrl(home.window.location), null);
});

test("never clones or consumes provider requests with a body", async () => {
  const sync = createChatGptConversationSync(
    async () => new Response("{}"),
    () => undefined,
  );
  const providerRequest = new Request(
    "https://chatgpt.com/backend-api/conversation",
    { body: "private provider payload", method: "POST" },
  );

  assert.equal(sync.cloneRequest([providerRequest]), null);
  assert.equal(await providerRequest.text(), "private provider payload");
});
