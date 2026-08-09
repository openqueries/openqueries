import { ArrowRight, Check, Code2, Eye, Sigma } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { siGithub, siGooglechrome } from "simple-icons";

import { BrandIcon, QueryInterface, SiteShell } from "./components";
import { StructuredData } from "./structured-data";
import { learnArticles } from "@/lib/learn";
import { absoluteUrl, DEFAULT_DESCRIPTION, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: "Open Queries — Make AI search transparent",
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
        }}
      />

      <section className="hero container">
        <div className="hero-copy">
          <p className="status-label">
            <i /> Open source · Chrome beta
          </p>
          <h1>See what AI actually searches.</h1>
          <p className="hero-deck">
            A transparent query trace for AI search. Inspect surfaced web
            searches, explore likely fan-outs and contribute to an open query
            history—without collecting conversations.
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

      <section className="trust-strip">
        <div className="container">
          <span>Supported now</span>
          <strong>ChatGPT</strong>
          <strong>Claude</strong>
          <strong>Google AI Overviews</strong>
          <em>Gemini surface next</em>
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

      <section className="method-preview">
        <div className="container method-preview-grid">
          <div>
            <p className="eyebrow">Provider-native methodology</p>
            <h2>No universal GPT ranker.</h2>
            <p>
              OpenAI candidates are generated and scored by GPT-5.6 Luna’s own
              output logprobs. The configured Gemini and Claude endpoints are
              reported separately through repeated native samples because those
              endpoints do not expose usable output logprobs.
            </p>
            <Link href="/methodology">
              Read the methodology <ArrowRight size={15} />
            </Link>
          </div>
          <div className="method-card">
            <span>Provider-native evidence</span>
            <code>p̂(q) = exp((1 / |Tq|) Σ log p(t))</code>
            <dl>
              <div>
                <dt>OpenAI</dt>
                <dd>gpt-5.6-luna · token logprobs</dd>
              </div>
              <div>
                <dt>Google</dt>
                <dd>gemini-3.1-flash-lite · 16 native samples</dd>
              </div>
              <div>
                <dt>Anthropic</dt>
                <dd>Claude Haiku 4.5 · 16 samples + Wilson CI</dd>
              </div>
            </dl>
          </div>
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
            "Donation is controllable, reversible and deletable by installation",
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
