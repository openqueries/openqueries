import type { MetadataRoute } from "next";

import { learnArticles } from "@/lib/learn";
import { absoluteUrl } from "@/lib/site";
import { topicPages } from "@/lib/topics";

const staticPages = [
  {
    path: "/",
    updatedAt: "2026-08-10",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/install",
    updatedAt: "2026-08-10",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/methodology",
    updatedAt: "2026-08-09",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/learn",
    updatedAt: "2026-08-10",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/open-source",
    updatedAt: "2026-08-09",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/privacy",
    updatedAt: "2026-08-09",
    changeFrequency: "yearly",
    priority: 0.4,
  },
  {
    path: "/terms",
    updatedAt: "2026-08-09",
    changeFrequency: "yearly",
    priority: 0.4,
  },
  {
    path: "/support",
    updatedAt: "2026-08-09",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: "/security",
    updatedAt: "2026-08-09",
    changeFrequency: "yearly",
    priority: 0.4,
  },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPages.map((page) => ({
      url: absoluteUrl(page.path),
      lastModified: new Date(`${page.updatedAt}T00:00:00.000Z`),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...topicPages.map((topic) => ({
      url: absoluteUrl(`/${topic.slug}`),
      lastModified: new Date(`${topic.updatedAt}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...learnArticles.map((article) => ({
      url: absoluteUrl(`/learn/${article.slug}`),
      lastModified: new Date(`${article.updatedAt}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
