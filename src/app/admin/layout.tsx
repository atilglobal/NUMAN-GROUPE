import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { connection } from "next/server";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Yönetim paneli | NUMAN GROUPE", template: "%s | Yönetim — NUMAN GROUPE" },
  robots: { index: false, follow: false },
};

/** Separate root layout: the panel is Turkish and shares nothing with the public chrome. */
export default async function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  await connection();
  return (
    <html lang="tr" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-paper-2/60 text-ink antialiased">{children}</body>
    </html>
  );
}
