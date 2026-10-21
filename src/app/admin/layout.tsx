import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { documentHtmlProps, googleNoTranslateMeta } from "@/i18n/document";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Yönetim paneli | NUMAN GROUPE", template: "%s | Yönetim — NUMAN GROUPE" },
  robots: { index: false, follow: false },
  other: googleNoTranslateMeta,
};

/** Session, cookies and Postgres are per-request; do not require an instant static shell. */
export const instant = false;

/** Separate root layout: the panel is Turkish and shares nothing with the public chrome. */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html {...documentHtmlProps("tr", `${inter.variable} h-full`)}>
      <body className="min-h-full bg-paper-2/60 text-ink antialiased">{children}</body>
    </html>
  );
}
