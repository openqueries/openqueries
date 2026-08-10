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
  title: "AI Search Query Inspector for ChatGPT, Claude & Google AI",
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
    copy: "Accept the privacy setting, then request plausible fan-outs ranked by each provider’s own token probabilities—or repeated native samples when logprobs are unavailable.",
  },
  {
    icon: Code2,
    title: "Audit the whole system",
    copy: "Extension, Worker, schemas and methodology are public under AGPL-3.0-or-later. No black-box ranking layer.",
  },
];

const searchGuides = [
  {
    href: "/ai-search-optimization",
    eyebrow: "Practical workflow",
    title: "AI search optimization",
    copy: "Connect human demand, retrieval evidence, one canonical and measurable outcomes without AI-only gimmicks.",
  },
  {
    href: "/ai-search-visibility",
    eyebrow: "AI visibility",
    title: "AI search visibility",
    copy: "Connect observed retrieval queries with citations, referrals and measurable visibility work.",
  },
  {
    href: "/generative-engine-optimization",
    eyebrow: "GEO",
    title: "Generative engine optimization",
    copy: "Build retrieval-friendly, evidence-led content without pretending that model visibility is a fixed rank.",
  },
  {
    href: "/answer-engine-optimization",
    eyebrow: "AEO",
    title: "Answer engine optimization",
    copy: "Turn answerable questions, source evidence and query language into a practical AEO framework.",
  },
  {
    href: "/fan-out-queries",
    eyebrow: "Retrieval vocabulary",
    title: "Fan-out queries",
    copy: "See how one broad information need can become several narrower evidence searches.",
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
          "@type": "Organization",
          name: "Open Queries Contributors",
          url: absoluteUrl("/"),
          logo: absoluteUrl("/og.png"),
          sameAs: [GITHUB_URL],
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
            unlocks the query trace and on-demand fan-out estimates after you
            accept the privacy setting.
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
              <Link href="/chatgpt-search-queries">
                <ProviderLogo provider="chatgpt" size={16} />
                <strong>ChatGPT</strong>
              </Link>
            </li>
            <li>
              <Link href="/claude-web-search">
                <ProviderLogo provider="claude" size={16} />
                <strong>Claude</strong>
              </Link>
            </li>
            <li>
              <Link href="/google-ai-overviews">
                <ProviderLogo provider="google" size={16} />
                <strong>Google AI Overviews</strong>
              </Link>
            </li>
          </ul>
          <span className="trust-next">Gemini surface next</span>
        </div>
      </section>

      <section className="learn-section content-hub-section">
        <div className="container">
          <div className="section-heading split">
            <div>
              <p className="eyebrow">Open AI search field guide</p>
              <h2>Start with evidence. Follow it to the workflow.</h2>
            </div>
            <Link href="/learn">
              All guides <ArrowRight size={14} />
            </Link>
          </div>
          <div className="article-grid">
            {learnArticles.map((article) => (
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

      <section className="learn-section pillar-hub-section">
        <div className="container">
          <div className="section-heading split">
            <div>
              <p className="eyebrow">Intent pillars</p>
              <h2>Build the complete AI search evidence chain.</h2>
            </div>
            <Link href="/install">
              Inspect queries in Chrome <ArrowRight size={14} />
            </Link>
          </div>
          <div className="article-grid pillar-grid">
            {searchGuides.map((guide) => (
              <Link href={guide.href} key={guide.href}>
                <span>{guide.eyebrow}</span>
                <h3>{guide.title}</h3>
                <p>{guide.copy}</p>
                <small>Read the practical guide</small>
              </Link>
            ))}
          </div>
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
            "Privacy starts unaccepted; accepting it reveals queries and unlocks fan-out estimates",
            "Sensitive-pattern filtering runs locally and at the Worker edge",
            "Eligible observed queries are written directly to D1",
            "Estimated fan-outs are never stored as observed queries",
          ].map((item) => (
            <li key={item}>
              <Check size={15} /> {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="closing-cta container">
        <div>
          <p className="eyebrow">Make AI search transparent</p>
          <h2>Build the query history AI search is missing.</h2>
          <p>Install, accept privacy and inspect. Every layer stays open.</p>
        </div>
        <Link className="button light" href="/install">
          <BrandIcon icon={siGooglechrome} size={17} />
          Get Open Queries
        </Link>
      </section>
    </SiteShell>
  );
}
