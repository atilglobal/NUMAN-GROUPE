import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal Node process for a durable host (VPS/container). Not a hosting-provider lock.
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/media/v/**" }],
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
