import type { Metadata } from "next";

import { EditorialPage } from "../components";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/security",
  title: "Security",
  description:
    "Report an Open Queries security or privacy-boundary vulnerability privately and safely.",
});

export default function SecurityPage() {
  return (
    <EditorialPage
      eyebrow="Security policy"
      title="Report sensitive failures privately."
      intro="Do not open a public issue for credential exposure, chat-boundary bypasses or donation-deletion failures."
    >
      <section>
        <h2>Private contact</h2>
        <p>
          Email{" "}
          <a href="mailto:security@openqueries.org">security@openqueries.org</a>{" "}
          or use a private GitHub security advisory. Include a minimal synthetic
          reproduction and the affected extension or API version.
        </p>
      </section>
      <section>
        <h2>High-priority reports</h2>
        <ul>
          <li>Extraction of chat messages or conversation metadata.</li>
          <li>Provider credentials present in an extension bundle or log.</li>
          <li>Cross-installation deletion or quota bypasses.</li>
          <li>A tombstoned donation being stored after deletion.</li>
          <li>Sensitive-query filters that can be bypassed.</li>
        </ul>
      </section>
      <section>
        <h2>Safe reporting</h2>
        <p>
          Never attach real chats, credentials or personal information. We will
          acknowledge valid reports and coordinate remediation before public
          disclosure.
        </p>
      </section>
    </EditorialPage>
  );
}
