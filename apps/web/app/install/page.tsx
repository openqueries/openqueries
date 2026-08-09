import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { siGithub, siGooglechrome } from "simple-icons";

import { BrandIcon, QueryInterface, SiteShell } from "../components";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/install",
  title: "Install the Open Queries Chrome extension",
  description:
    "Install or preview the open-source Open Queries side-panel extension for ChatGPT, Claude and Google Search.",
});

export default function InstallPage() {
  return (
    <SiteShell>
      <header className="install-hero container">
        <p className="status-label">
          <i /> Chrome beta
        </p>
        <h1>Put the AI search trace beside the conversation.</h1>
        <p>
          Open Queries runs as a clean Chrome side panel. It reads explicit
          web-search UI—not chat messages—and estimates fan-outs only when you
          ask.
        </p>
        <div className="hero-actions">
          <a
            className="button primary"
            href="https://github.com/openqueries/openqueries/releases"
          >
            <BrandIcon icon={siGooglechrome} size={17} />
            Download beta
          </a>
          <a
            className="button secondary"
            href="https://github.com/openqueries/openqueries"
          >
            <BrandIcon icon={siGithub} size={17} />
            Inspect source
          </a>
        </div>
        <span className="install-disclosure">
          The Chrome Web Store listing will appear here when the public beta is
          approved. Until then, releases are installable in developer mode.
        </span>
      </header>

      <section className="install-preview container">
        <QueryInterface />
        <div className="install-steps">
          <p className="eyebrow">Install from a release</p>
          <h2>Three transparent steps.</h2>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Download and unpack</strong>
                <p>Use a signed project release from the public repository.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Load the extension</strong>
                <p>
                  Open chrome://extensions, enable Developer mode and select the
                  unpacked build.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Choose donation settings</strong>
                <p>
                  Review the exact data boundary before enabling the shared
                  query-history contribution.
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
            "Server donations can be deleted and the anonymous ID rotated",
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
