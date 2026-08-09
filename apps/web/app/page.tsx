import { ArrowRight, Check, Code2, Eye, Sigma } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProviderLogo } from "@openqueries/provider-icons";
import { siGithub, siGooglechrome } from "simple-icons";

import { BrandIcon, QueryInterface, SiteShell } from "./components";
import { StructuredData } from "./structured-data";
import { learnArticles } from "@/lib/learn";
import {
  absoluteUrl,
  CHROME_WEB_STORE_URL,
  DEFAULT_DESCRIPTION,
  GITHUB_URL,
  pageMetadata,
} from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: "Open Queries — AI Search Query Inspector",
  description: DEFAULT_DESCRIPTION,
});

const capabilities = [
  {
    icon: Eye,
    title: "See the retrieval layer",
    copy: "Capture web-search queries explicitly surfaced by ChatGPT, Claude and Google Search in a local side-panel trace.",
  },
  {
    icon: Sigma,
    title: "Estimate with native evidence",
    copy: "Request plausible fan-outs ranked by each provider’s own token probabilities—or repeated native samples when logprobs are unavailable.",
  },
  {
    icon: Code2,
    title: "Audit the whole system",
    copy: "Extension, Worker, schemas and methodology are public under AGPL-3.0-or-later. No black-box ranking layer.",
  },
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
          sameAs: [
            GITHUB_URL,
            ...(CHROME_WEB_STORE_URL ? [CHROME_WEB_STORE_URL] : []),
          ],
        }}
      />

      <section className="hero container">
        <div className="hero-copy">
          <p className="status-label">
            <i /> Open-source Chrome extension
          </p>
          <h1>See the queries behind AI search.</h1>
          <p className="hero-deck">
            Open Queries shows the web-search queries surfaced by ChatGPT,
            Claude and Google AI Overviews in a local Chrome side panel—and
            estimates likely fan-out queries only when you ask.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/install">
              <BrandIcon icon={siGooglechrome} size={17} />
              Get the extension
            </Link>
            <a
              className="button secondary"
              href="https://github.com/openqueries/openqueries"
            >
              <BrandIcon icon={siGithub} size={17} />
              View source
            </a>
          </div>
          <p className="hero-note">
            Queries, not conversations · Observed stays observed · AGPL-3.0
          </p>
        </div>
        <QueryInterface />
      </section>

      <section
        className="trust-strip"
        aria-label="Supported AI search surfaces"
      >
        <div className="container">
          <span className="trust-label">Supported now</span>
          <ul className="trust-providers">
            <li>
              <ProviderLogo provider="chatgpt" size={16} />
              <strong>ChatGPT</strong>
            </li>
            <li>
              <ProviderLogo provider="claude" size={16} />
              <strong>Claude</strong>
            </li>
            <li>
              <ProviderLogo provider="google" size={16} />
              <strong>Google AI Overviews</strong>
            </li>
          </ul>
          <span className="trust-next">Gemini surface next</span>
        </div>
      </section>

      <section className="capability-section container">
        <div className="section-heading centered">
          <p className="eyebrow">The open retrieval layer</p>
          <h2>Useful to inspect. Rigorous enough to audit.</h2>
          <p>
            Open Queries keeps direct observations and probabilistic estimates
            separate from capture through aggregation.
          </p>
        </div>
        <div className="capability-grid">
          {capabilities.map(({ icon: Icon, title, copy }) => (
            <article key={title}>
              <span>
                <Icon size={18} />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="privacy-section container">
        <div>
          <p className="eyebrow">A narrow data contract</p>
          <h2>Transparent without surveillance.</h2>
        </div>
        <ul>
          {[
            "No chat messages, titles, account identity or conversation URLs",
            "Query contribution is separate, optional and off until you choose it",
            "Sensitive-pattern filtering runs locally and at the Worker edge",
            "Public aggregates require at least five anonymous donors",
            "Estimated fan-outs never enter observed-query aggregates",
          ].map((item) => (
            <li key={item}>
              <Check size={15} /> {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="learn-section">
        <div className="container">
          <div className="section-heading split">
            <div>
              <p className="eyebrow">Open methodology</p>
              <h2>Read the evidence, not the marketing.</h2>
            </div>
            <Link href="/learn">
              All guides <ArrowRight size={14} />
            </Link>
          </div>
          <div className="article-grid">
            {learnArticles.slice(0, 4).map((article) => (
              <Link href={`/learn/${article.slug}`} key={article.slug}>
                <span>{article.eyebrow}</span>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <small>{article.readMinutes} min read</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-cta container">
        <div>
          <p className="eyebrow">Make AI search transparent</p>
          <h2>Build the query history AI search is missing.</h2>
          <p>Install, inspect and contribute. Every layer stays open.</p>
        </div>
        <Link className="button light" href="/install">
          <BrandIcon icon={siGooglechrome} size={17} />
          Get Open Queries
        </Link>
      </section>
    </SiteShell>
  );
}
