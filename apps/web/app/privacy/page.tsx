import type { Metadata } from "next";

import { EditorialPage } from "../components";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description:
    "The Open Queries browser-extension privacy policy for AI search queries.",
});

export default function PrivacyPage() {
  return (
    <EditorialPage
      eyebrow="Privacy · Effective 9 August 2026"
      title="Queries, not conversations."
      intro="This policy describes the first public Open Queries release. The product is intentionally engineered around a small data contract."
    >
      <section>
        <h2>What can be stored locally</h2>
        <p>
          The extension stores observed queries, platform, source kind, capture
          time, language, adapter version and generated estimates. Local history
          is automatically limited to 30 days and 2,000 events and can be
          deleted at any time.
        </p>
      </section>
      <section>
        <h2>What happens when privacy is accepted</h2>
        <p>
          Privacy starts unaccepted. After it is accepted during onboarding or
          later in Settings, every observed query is automatically sent with a
          random pseudonymous installation tag, whether or not its fan-outs are
          requested. For Google Search, the typed search query is included as
          the clearly disclosed exception. Until privacy is accepted, the
          Current and History views show no query data. Privacy acceptance can
          be switched off and server-side query data can be deleted at any time.
        </p>
      </section>
      <section>
        <h2>What is never part of the contract</h2>
        <ul>
          <li>Chat messages or prompts on ChatGPT and Claude.</li>
          <li>Conversation titles, chat URLs or conversation identifiers.</li>
          <li>Account names, email addresses or provider cookies.</li>
          <li>Browser history outside supported pages.</li>
          <li>Estimated fan-outs represented as observed demand.</li>
        </ul>
      </section>
      <section>
        <h2>How provider pages are read</h2>
        <p>
          Open Queries extracts only explicit search-tool fields. ChatGPT can
          expose these as structured <code>search_queries</code> metadata when
          its interface shows only a website count; Claude and Google expose
          supported queries in search UI. Ordinary message fields are ignored
          and never enter extension storage or an Open Queries request.
        </p>
      </section>
      <section>
        <h2>Processing and retention</h2>
        <p>
          While privacy is accepted, every observed search query is sent to Open
          Queries. A requested fan-out generation sends the selected query to
          the corresponding model provider for provider-native estimation. Open
          Queries never sends one provider's candidates to a universal GPT
          ranker.
        </p>
        <p>
          Raw query events expire after 13 months. Cloudflare provides hosting
          and D1 storage; OpenAI, Anthropic and Google process fan-out requests
          for their respective roles.
        </p>
      </section>
      <section>
        <h2>Your controls</h2>
        <p>
          Settings provides separate controls to clear local history, stop
          future transfer and delete server-side events linked to the current
          installation. Server deletion rotates the installation's pseudonymous
          identifier. Estimated fan-outs are not stored as observed queries.
        </p>
      </section>
      <section>
        <h2>Contact and changes</h2>
        <p>
          Open Queries Contributors operates this first public release. Privacy
          questions and deletion failures can be sent to{" "}
          <a href="mailto:privacy@openqueries.org">privacy@openqueries.org</a>.
          Material policy changes will receive a new effective date and a
          release note.
        </p>
      </section>
    </EditorialPage>
  );
}
