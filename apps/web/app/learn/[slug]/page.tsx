import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "../../components";
import { StructuredData } from "../../structured-data";
import { getLearnArticle, learnArticles } from "@/lib/learn";
import { absoluteUrl, pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return learnArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) return {};
  return pageMetadata({
    path: `/learn/${slug}`,
    title: article.title,
    description: article.description,
  });
}

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) notFound();
  return (
    <SiteShell>
      <StructuredData
        value={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          datePublished: article.publishedAt,
          dateModified: article.publishedAt,
          mainEntityOfPage: absoluteUrl(`/learn/${article.slug}`),
          author: { "@type": "Organization", name: "Open Queries" },
          publisher: { "@type": "Organization", name: "Open Queries" },
        }}
      />
      <header className="article-hero container">
        <Link href="/learn">← All guides</Link>
        <p className="eyebrow">{article.eyebrow}</p>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>
          {article.readMinutes} min read · Published {article.publishedAt}
        </span>
      </header>
      <article className="article-body container">
        {article.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets ? (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>
    </SiteShell>
  );
}
