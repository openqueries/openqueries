import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { siGithub, siGooglechrome } from "simple-icons";

import { BrandIcon, QueryInterface, SiteShell } from "../components";
import { Breadcrumbs } from "../content-components";
import { StructuredData } from "../structured-data";
import {
  absoluteUrl,
  CHROME_WEB_STORE_URL,
  GITHUB_URL,
  pageMetadata,
} from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/install",
  title: "AI Search Extension for ChatGPT, Claude & Google AI",
  description:
    "Install the open-source Open Queries AI search extension for ChatGPT, Claude and Google AI Overviews, or preview the release on GitHub.",
});

export default function InstallPage() {
  return (
    <SiteShell>
      <StructuredData
        value={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: absoluteUrl("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Install",
              item: absoluteUrl("/install"),
            },
          ],
        }}
      />
      <header className="install-hero container">
        <Breadcrumbs
          items={[{ href: "/", label: "Home" }, { label: "Install" }]}
        />
        <p className="status-label">
          <i /> Chrome Web Store
        </p>
        <h1>Install the Open Queries AI search extension.</h1>
        <p>
          Open Queries puts the retrieval trace beside ChatGPT, Claude and
          Google AI Overviews in a clean Chrome side panel. It reads explicit
          web-search signals—not chat messages—and keeps observed queries
          separate from on-demand fan-out estimates.
        </p>
        <div className="hero-actions">
          <a className="button primary" href={CHROME_WEB_STORE_URL}>
            <BrandIcon icon={siGooglechrome} size={17} />
            Add to Chrome
          </a>
          <a className="button secondary" href={`${GITHUB_URL}/releases`}>
            <BrandIcon icon={siGithub} size={17} />
            Download release
          </a>
        </div>
        <span className="install-disclosure">
          Version 1.0.5 is under Chrome Web Store review. Until Google makes the
          listing public, the identical open-source package remains available
          from the GitHub release.
        </span>
      </header>

      <section className="install-preview container">
        <QueryInterface />
        <div className="install-steps">
          <p className="eyebrow">Install from Chrome</p>
          <h2>Three transparent steps.</h2>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Add the extension</strong>
                <p>Install the reviewed package from the Chrome Web Store.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Open the side panel</strong>
                <p>
                  Pin Open Queries, then click its toolbar icon beside a
                  supported AI search page.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Accept privacy</strong>
                <p>
                  Review the exact data boundary. Privacy acceptance reveals the
                  query trace and unlocks on-demand fan-out estimates.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="install-safety container">
        <div>
          <ShieldCheck size={20} />
          <h2>The permission boundary is the product.</h2>
        </div>
        <ul>
          {[
            "ChatGPT, Claude and supported Google Search pages only",
            "No messages, account identity or conversation metadata",
            "Local 30-day trace with one-click deletion",
            "Server query data can be deleted and the anonymous ID rotated",
          ].map((item) => (
            <li key={item}>
              <Check size={14} /> {item}
            </li>
          ))}
        </ul>
        <Link href="/privacy">
          Read the privacy contract <ArrowRight size={14} />
        </Link>
      </section>
    </SiteShell>
  );
}
