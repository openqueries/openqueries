import type { Metadata } from "next";

export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://openqueries.org";
export const SITE_NAME = "Open Queries";
export const DEFAULT_DESCRIPTION =
  "An open-source AI search query inspector for ChatGPT, Claude and Google AI Overviews. See surfaced web searches and inspect likely fan-out queries.";
export const GITHUB_URL = "https://github.com/openqueries/openqueries";
export const CHROME_WEB_STORE_URL =
  process.env.NEXT_PUBLIC_CHROME_WEB_STORE_URL || "";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}

export function pageMetadata(options: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = absoluteUrl(options.path);
  return {
    title: options.title,
    description: options.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: options.title,
      description: options.description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: absoluteUrl("/og.png"), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [absoluteUrl("/og.png")],
    },
  };
}
