import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { DEFAULT_DESCRIPTION, SITE_ORIGIN } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Open Queries — AI Search Query Inspector",
    template: "%s · Open Queries",
  },
  description: DEFAULT_DESCRIPTION,
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
