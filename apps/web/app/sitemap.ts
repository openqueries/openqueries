import type { MetadataRoute } from "next";

import { learnArticles } from "@/lib/learn";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-08-09T00:00:00.000Z");
  return [
    {
      url: absoluteUrl("/"),
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/methodology"),
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/learn"),
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/open-source"),
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    ...learnArticles.map((article) => ({
      url: absoluteUrl(`/learn/${article.slug}`),
      lastModified: new Date(`${article.publishedAt}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
