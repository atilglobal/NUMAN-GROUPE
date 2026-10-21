import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { documentHtmlProps, googleNoTranslateMeta } from "@/i18n/document";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  other: googleNoTranslateMeta,
};

export const instant = false;

export default function SetupLayout({ children }: { children: ReactNode }) {
  return (
    <html {...documentHtmlProps("tr", `${inter.variable} h-full`)}>
      <body className="min-h-full bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
