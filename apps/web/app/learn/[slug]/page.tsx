import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteShell } from "../../components";
import {
  ArticleToc,
  Breadcrumbs,
  ContentSections,
  DirectAnswer,
  InstallCta,
  RelatedLinks,
  SourceList,
} from "../../content-components";
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
          dateModified: article.updatedAt,
          mainEntityOfPage: absoluteUrl(`/learn/${article.slug}`),
          isPartOf: {
            "@type": "WebSite",
            name: "Open Queries",
            url: absoluteUrl("/"),
          },
          about: article.about.map((name) => ({ "@type": "Thing", name })),
          author: { "@type": "Organization", name: "Open Queries" },
          publisher: { "@type": "Organization", name: "Open Queries" },
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
            {
              "@type": "ListItem",
              position: 3,
              name: article.title,
              item: absoluteUrl(`/learn/${article.slug}`),
            },
          ],
        }}
      />
      <header className="article-hero container">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/learn", label: "Learn" },
            { label: article.title },
          ]}
        />
        <p className="eyebrow">{article.eyebrow}</p>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>
          {article.readMinutes} min read · Updated {article.updatedAt}
        </span>
      </header>
      <article className="article-body container content-shell">
        <div className="content-layout">
          <ArticleToc sections={article.sections} />
          <div className="article-main">
            <DirectAnswer>{article.directAnswer}</DirectAnswer>
            <ContentSections sections={article.sections} />
            <SourceList sources={article.sources} />
            <RelatedLinks links={article.related} />
            <InstallCta />
          </div>
        </div>
      </article>
    </SiteShell>
  );
}
