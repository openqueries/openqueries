import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "../components";
import { Breadcrumbs } from "../content-components";
import { StructuredData } from "../structured-data";
import { learnArticles } from "@/lib/learn";
import { absoluteUrl, pageMetadata } from "@/lib/site";
import { topicPages } from "@/lib/topics";

export const metadata: Metadata = pageMetadata({
  path: "/learn",
  title: "Learn",
  description:
    "Practical guides to AI search queries, fan-out retrieval, AEO and GEO evidence.",
});

export default function LearnPage() {
  return (
    <SiteShell>
      <StructuredData
        value={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Open Queries AI search guides",
          description:
            "Practical guides to AI search queries, fan-out retrieval, AEO and GEO evidence.",
          url: absoluteUrl("/learn"),
          mainEntityOfPage: absoluteUrl("/learn"),
          isPartOf: {
            "@type": "WebSite",
            name: "Open Queries",
            url: absoluteUrl("/"),
          },
          hasPart: learnArticles.map((article) => ({
            "@type": "Article",
            name: article.title,
            url: absoluteUrl(`/learn/${article.slug}`),
          })),
          inLanguage: "en",
        }}
      />
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
              name: "Learn",
              item: absoluteUrl("/learn"),
            },
          ],
        }}
      />
      <header className="editorial-hero container">
        <Breadcrumbs
          items={[{ href: "/", label: "Home" }, { label: "Learn" }]}
        />
        <p className="eyebrow">Open guides</p>
        <h1>Understand the retrieval layer.</h1>
        <p>
          Concise explanations for using AI-query evidence without overstating
          what the data can prove.
        </p>
      </header>
      <section className="learn-directory container">
        {learnArticles.map((article, index) => (
          <Link href={`/learn/${article.slug}`} key={article.slug}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <small>{article.eyebrow}</small>
              <h2>{article.title}</h2>
              <p>{article.description}</p>
            </div>
            <strong>→</strong>
          </Link>
        ))}
      </section>
      <section className="topic-directory container">
        <div className="section-heading split">
          <div>
            <p className="eyebrow">Intent pillars</p>
            <h2>Apply the evidence to a concrete AI search job.</h2>
          </div>
          <Link href="/install">Install the AI search extension →</Link>
        </div>
        <div className="topic-directory-grid">
          {topicPages.map((topic) => (
            <Link href={`/${topic.slug}`} key={topic.slug}>
              <small>{topic.eyebrow}</small>
              <h3>{topic.title}</h3>
              <p>{topic.directAnswer}</p>
              <strong>Read the pillar →</strong>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
