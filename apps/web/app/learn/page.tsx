import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "../components";
import { learnArticles } from "@/lib/learn";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/learn",
  title: "Learn",
  description:
    "Practical guides to AI search queries, fan-out retrieval, AEO and GEO evidence.",
});

export default function LearnPage() {
  return (
    <SiteShell>
      <header className="editorial-hero container">
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
    </SiteShell>
  );
}
