import type { Metadata } from "next";

import { EditorialPage } from "../components";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/open-source",
  title: "Open source",
  description:
    "Why Open Queries uses AGPL and how to contribute to transparent AI-search infrastructure.",
});

export default function OpenSourcePage() {
  return (
    <EditorialPage
      eyebrow="AGPL-3.0-or-later"
      title="Inspect every boundary."
      intro="A transparency project should make its own collection rules, scoring method and server behavior open to inspection."
    >
      <section>
        <h2>One cumulative repository</h2>
        <p>
          The Plasmo extension, versioned contracts, privacy filters, Cloudflare
          Worker and public website live in one monorepo. A change to what the
          browser may emit can therefore be reviewed alongside what the backend
          accepts.
        </p>
      </section>
      <section>
        <h2>Why AGPL</h2>
        <p>
          AGPL preserves the right to inspect modified versions, including
          versions offered as a hosted network service. That matches the
          project's aim: query infrastructure should not become another opaque
          data collector.
        </p>
      </section>
      <section>
        <h2>Useful contributions</h2>
        <ul>
          <li>
            Sanitized DOM fixtures when provider search interfaces change.
          </li>
          <li>
            Accessibility and localization improvements for the side panel.
          </li>
          <li>Evaluation sets for multilingual fan-out quality.</li>
          <li>Privacy-filter tests and adversarial schema cases.</li>
          <li>
            Documentation that sharpens the observed-versus-estimated
            distinction.
          </li>
        </ul>
        <p>
          <a
            className="inline-cta"
            href="https://github.com/openqueries/openqueries"
          >
            Open the repository ↗
          </a>
        </p>
      </section>
    </EditorialPage>
  );
}
