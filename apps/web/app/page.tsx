import type { Metadata } from "next";
import Link from "next/link";

import { QueryInterface, SiteShell } from "./components";
import { StructuredData } from "./structured-data";
import { learnArticles } from "@/lib/learn";
import { absoluteUrl, DEFAULT_DESCRIPTION, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: "Open Queries — Make AI search transparent",
  description: DEFAULT_DESCRIPTION,
});

const principles = [
  [
    "01",
    "Queries, not conversations",
    "The extension reads explicit web-search tool activity. Chat messages, titles and conversation URLs stay outside the contract.",
  ],
  [
    "02",
    "Observed stays observed",
    "Real UI evidence is never mixed with synthetic fan-out estimates. Provenance travels with every record.",
  ],
  [
    "03",
    "Open by construction",
    "Extension, worker, data contracts and methodology are licensed under AGPL-3.0-or-later.",
  ],
  [
    "04",
    "Useful before clever",
    "A clean live trace creates immediate value. Public aggregates come only after the privacy threshold is met.",
  ],
];

export default function HomePage() {
  return (
    <SiteShell>
      <StructuredData
        value={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Open Queries",
          url: absoluteUrl("/"),
          description: DEFAULT_DESCRIPTION,
          inLanguage: "en",
        }}
      />
      <StructuredData
        value={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Open Queries",
          applicationCategory: "BrowserApplication",
          operatingSystem: "Chrome",
          description: DEFAULT_DESCRIPTION,
          url: absoluteUrl("/"),
          license: "https://www.gnu.org/licenses/agpl-3.0.html",
        }}
      />
      <section className="hero container">
        <div className="hero-copy">
          <p className="status-label">
            <i /> Open-source query infrastructure
          </p>
          <h1>
            See what AI
            <br />
            actually searches.
          </h1>
          <p className="hero-deck">
            Open Queries reveals the web-search queries surfaced by ChatGPT,
            Claude and Google—then estimates the fan-outs they might have used,
            without recording your conversations.
          </p>
          <div className="hero-actions" id="install">
            <a
              className="button primary"
              href="https://github.com/openqueries/openqueries"
            >
              View on GitHub <span>↗</span>
            </a>
            <Link className="button secondary" href="/methodology">
              Read the method
            </Link>
          </div>
          <p className="hero-note">
            Chrome beta · ChatGPT, Claude and Google Search · AGPL-3.0
          </p>
        </div>
        <QueryInterface />
      </section>

      <section className="trust-strip">
        <div className="container">
          <span>Supported surfaces</span>
          <strong>ChatGPT</strong>
          <strong>Claude</strong>
          <strong>Google AI Overviews</strong>
          <em>Gemini planned</em>
        </div>
      </section>

      <section className="problem-section container">
        <div>
          <p className="eyebrow">The missing history</p>
          <h2>Keyword tools stop where AI retrieval starts.</h2>
        </div>
        <div>
          <p>
            Answer engines can decompose one request into multiple searches
            before they cite a source. Those retrieval queries rarely appear in
            conventional keyword histories, leaving AEO and GEO teams to
            optimize around outputs instead of the searches behind them.
          </p>
          <p>
            Open Queries turns the visible part of that process into a
            transparent, community-owned evidence layer.
          </p>
        </div>
      </section>

      <section className="workflow-section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2>
              A narrow data contract.
              <br />A useful live trace.
            </h2>
          </div>
          <div className="workflow-grid">
            <article>
              <span>01</span>
              <h3>Observe</h3>
              <p>
                Provider-specific adapters watch only explicitly labelled
                web-search UI inside the supported page.
              </p>
              <code>observed_model_search</code>
            </article>
            <article>
              <span>02</span>
              <h3>Inspect</h3>
              <p>
                The side panel keeps a searchable local history and shows where
                and when each query appeared.
              </p>
              <code>30 days · local first</code>
            </article>
            <article>
              <span>03</span>
              <h3>Estimate</h3>
              <p>
                On request, a provider-matched model proposes fan-outs and a
                shared log-probability scorer ranks them.
              </p>
              <code>estimated ≠ observed</code>
            </article>
            <article>
              <span>04</span>
              <h3>Contribute</h3>
              <p>
                With donation enabled, safe observed queries help build a
                privacy-thresholded public history.
              </p>
              <code>k ≥ 5 donors</code>
            </article>
          </div>
        </div>
      </section>

      <section className="principles-section container">
        <div className="section-heading split">
          <div>
            <p className="eyebrow">Project principles</p>
            <h2>Transparency without surveillance.</h2>
          </div>
          <p>
            Open source is not only a distribution choice here. It makes the
            extraction boundary, scoring method and retention policy
            inspectable.
          </p>
        </div>
        <div className="principles-list">
          {principles.map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="learn-section">
        <div className="container">
          <div className="section-heading split">
            <div>
              <p className="eyebrow">Open methodology</p>
              <h2>Use the signal carefully.</h2>
            </div>
            <Link href="/learn">Browse all guides →</Link>
          </div>
          <div className="article-grid">
            {learnArticles.map((article) => (
              <Link href={`/learn/${article.slug}`} key={article.slug}>
                <span>{article.eyebrow}</span>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <small>{article.readMinutes} min read · Open guide →</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-cta container">
        <div>
          <p className="eyebrow">A group effort</p>
          <h2>Help make AI search legible.</h2>
          <p>
            Inspect the source, test an adapter or contribute observed query
            evidence.
          </p>
        </div>
        <a
          className="button light"
          href="https://github.com/openqueries/openqueries"
        >
          Explore the repository ↗
        </a>
      </section>
    </SiteShell>
  );
}
