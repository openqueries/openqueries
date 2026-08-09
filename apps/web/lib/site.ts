import type { Metadata } from "next";

export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://openqueries.org";
export const SITE_NAME = "Open Queries";
export const DEFAULT_DESCRIPTION =
  "See the web-search queries AI assistants use and estimate likely fan-out queries—without collecting chat messages.";

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
      images: [{ url: absoluteUrl("/og.svg"), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [absoluteUrl("/og.svg")],
    },
  };
}
