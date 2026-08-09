import { Mail, MessageCircleQuestion } from "lucide-react";
import type { Metadata } from "next";
import { siGithub } from "simple-icons";

import { BrandIcon, EditorialPage } from "../components";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/support",
  title: "Support",
  description:
    "Get help with the Open Queries Chrome extension, supported AI search surfaces, privacy controls and fan-out estimates.",
});

export default function SupportPage() {
  return (
    <EditorialPage
      eyebrow="Open Queries support"
      title="Help with the query trace."
      intro="Start with the common checks below. If the problem remains, send a short synthetic reproduction—never a real private conversation."
    >
      <section>
        <h2>Side panel does not open</h2>
        <p>
          Click the Open Queries toolbar icon on a normal browser tab. If Chrome
          recently updated the extension, open <code>chrome://extensions</code>,
          reload Open Queries and try again. The release build includes a
          service-worker boot test for this path.
        </p>
      </section>
      <section>
        <h2>A search is missing</h2>
        <p>
          Open Queries records only queries inside recognized search-specific
          provider UI. A provider redesign can make an adapter fail closed until
          its boundary is updated; chat text is never used as a fallback.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <div className="contact-grid">
          <a href="mailto:support@openqueries.org">
            <Mail size={18} />
            <strong>Email support</strong>
            <span>support@openqueries.org</span>
          </a>
          <a href="https://github.com/openqueries/openqueries/issues">
            <BrandIcon icon={siGithub} size={18} />
            <strong>Public issue</strong>
            <span>Bug reports and feature requests</span>
          </a>
          <a href="https://github.com/openqueries/openqueries/discussions">
            <MessageCircleQuestion size={18} />
            <strong>Discussion</strong>
            <span>Methodology and privacy questions</span>
          </a>
        </div>
      </section>
    </EditorialPage>
  );
}
