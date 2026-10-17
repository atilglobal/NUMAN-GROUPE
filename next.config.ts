import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel bundles Next itself; standalone is for a durable Node/VPS host.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/media/v/**" }],
  },
  outputFileTracingIncludes: {
    "/setup": ["./drizzle/**"],
    "/setup/**": ["./drizzle/**"],
  },
  async headers() {
    return [
      {
        source: "/setup",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  experimental: {
    // Root layout lives under app/[locale]; unmatched URLs need a standalone 404.
    globalNotFound: true,
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  async redirects() {
    return [
      { source: "/", destination: "/fr", permanent: true },
      {
        source: "/fr/visites-officielles",
        destination: "/fr/visites-institutionnelles",
        permanent: true,
      },
      {
        source: "/fr/visites-officielles/:slug",
        destination: "/fr/visites-institutionnelles/:slug",
        permanent: true,
      },
      {
        source: "/en/official-visits",
        destination: "/en/institutional-visits",
        permanent: true,
      },
      {
        source: "/en/official-visits/:slug",
        destination: "/en/institutional-visits/:slug",
        permanent: true,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
