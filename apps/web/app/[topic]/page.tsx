import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProviderLogo } from "@openqueries/provider-icons";

import { EditorialPage } from "../components";
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
      intro={topic.intro}
    >
      <StructuredData
        value={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: topic.title,
          description: topic.description,
          url: absoluteUrl(`/${topic.slug}`),
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
      {topic.sections.map((section) => (
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
      <section className="related-links">
        <h2>Continue exploring</h2>
        <div>
          {topic.related.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label} <span>↗</span>
            </Link>
          ))}
        </div>
      </section>
    </EditorialPage>
  );
}
