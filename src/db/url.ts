/**
 * Connection string for Postgres. Vercel/Neon integrations often inject
 * POSTGRES_URL instead of DATABASE_URL; both are accepted.
 */
export function resolveDatabaseUrl(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  const candidates = [
    env.DATABASE_URL,
    // node-postgres needs a direct connection; Neon/Vercel pooler URLs break prepared statements.
    env.POSTGRES_URL_NON_POOLING,
    env.POSTGRES_URL,
    env.POSTGRES_PRISMA_URL,
  ];
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

export function missingDatabaseUrlMessage(): string {
  return [
    "DATABASE_URL is not set (POSTGRES_URL from a Vercel/Neon integration is also accepted).",
    "On Vercel: Project → Settings → Environment Variables → add DATABASE_URL (or connect Neon), enable Production, Preview and Development, then Redeploy.",
    "Locally: copy .env.example to .env.local and follow docs/database.md.",
  ].join(" ");
}
