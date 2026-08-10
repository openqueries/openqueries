import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProviderLogo } from "@openqueries/provider-icons";

import { EditorialPage } from "../components";
import {
  ArticleToc,
  Breadcrumbs,
  ContentSections,
  DirectAnswer,
  InstallCta,
  KeyTakeaways,
  RelatedLinks,
  SourceList,
} from "../content-components";
import { StructuredData } from "../structured-data";
import { topicPageBySlug, topicPages } from "@/lib/topics";
import { absoluteUrl, pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return topicPages.map(({ slug }) => ({ topic: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic: slug } = await params;
  const topic = topicPageBySlug.get(slug);
  if (!topic) return {};
  return pageMetadata({
    path: `/${topic.slug}`,
    title: topic.title,
    description: topic.description,
  });
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  const topic = topicPageBySlug.get(slug);
  if (!topic) notFound();

  return (
    <EditorialPage
      eyebrow={topic.eyebrow}
      title={topic.title}
      intro={topic.description}
      meta={`${topic.readMinutes} min practical guide · Updated ${topic.updatedAt}`}
      breadcrumbs={
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/learn", label: "AI search guides" },
            { label: topic.title },
          ]}
        />
      }
      wide
    >
      <StructuredData
        value={{
          "@context": "https://schema.org",
          "@type": topic.schemaType,
          headline: topic.title,
          description: topic.description,
          url: absoluteUrl(`/${topic.slug}`),
          mainEntityOfPage: absoluteUrl(`/${topic.slug}`),
          keywords: topic.about.join(", "),
          citation: topic.sources.map((source) => source.url),
          datePublished: topic.publishedAt,
          dateModified: topic.updatedAt,
          isPartOf: {
            "@type": "WebSite",
            name: "Open Queries",
            url: absoluteUrl("/"),
          },
          about: topic.about.map((name) => ({ "@type": "Thing", name })),
          author: {
            "@type": "Organization",
            name: "Open Queries Contributors",
          },
          publisher: {
            "@type": "Organization",
            name: "Open Queries Contributors",
          },
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
              name: "AI search guides",
              item: absoluteUrl("/learn"),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: topic.title,
              item: absoluteUrl(`/${topic.slug}`),
            },
          ],
        }}
      />
      <div className="content-layout">
        <ArticleToc sections={topic.sections} className="desktop-article-toc" />
        <div className="article-main">
          <DirectAnswer>{topic.directAnswer}</DirectAnswer>
          <KeyTakeaways items={topic.keyTakeaways} />
          <ArticleToc
            sections={topic.sections}
            className="mobile-article-toc"
          />
          {topic.provider && topic.providerLabel ? (
            <div className="topic-provider">
              <ProviderLogo
                provider={topic.provider}
                size={22}
                title={topic.providerLabel}
              />
              <span>
                Compatibility target: <strong>{topic.providerLabel}</strong>
              </span>
            </div>
          ) : null}
          <ContentSections sections={topic.sections} />
          <SourceList sources={topic.sources} />
          <RelatedLinks links={topic.related} />
          <InstallCta />
        </div>
      </div>
    </EditorialPage>
  );
}
