import type { PoolConfig } from "pg";

/** node-postgres options for local clusters and hosted Postgres (Neon, Supabase). */
export function postgresPoolConfig(
  connectionString: string,
  env: NodeJS.ProcessEnv = process.env,
): PoolConfig {
  const poolMax = Number(env.DATABASE_POOL_MAX ?? (env.VERCEL ? 1 : 5));
  const hosted =
    Boolean(env.VERCEL) ||
    /sslmode=require/i.test(connectionString) ||
    /neon\.tech|supabase\.co|pooler\.supabase|vercel-storage/i.test(connectionString);
  return {
    connectionString,
    max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 5,
    ssl: hosted ? { rejectUnauthorized: false } : undefined,
  };
}
