import { describe, expect, it } from "vitest";
import { isProductionMigrateEnv, isSetupRuntimeAllowed, setupKeyFromEnv } from "./policy";

const db = { DATABASE_URL: "postgres://user:pass@db.example:5432/numan" };
const key = { SETUP_KEY: "k".repeat(16) };

describe("setup policy", () => {
  it("does not invent a default setup key", () => {
    expect(setupKeyFromEnv({})).toBeNull();
    expect(setupKeyFromEnv({ SETUP_KEY: "short" })).toBeNull();
    expect(setupKeyFromEnv({ BETTER_AUTH_SECRET: "s".repeat(32) })).toBeNull();
  });

  it("closes setup in Preview and when the key or database is missing", () => {
    expect(isSetupRuntimeAllowed({ ...db, ...key, VERCEL_ENV: "preview" })).toBe(false);
    expect(isSetupRuntimeAllowed({ ...key })).toBe(false);
    expect(isSetupRuntimeAllowed({ ...db })).toBe(false);
    expect(isSetupRuntimeAllowed({ ...db, ...key, VERCEL_ENV: "production" })).toBe(true);
  });

  it("applies reviewed migrations only on Vercel Production", () => {
    expect(isProductionMigrateEnv({ VERCEL_ENV: "production" })).toBe(true);
    expect(isProductionMigrateEnv({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isProductionMigrateEnv({})).toBe(false);
  });
});
