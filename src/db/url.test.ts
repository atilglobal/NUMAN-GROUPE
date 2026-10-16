import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "./url";

describe("resolveDatabaseUrl", () => {
  it("prefers DATABASE_URL", () => {
    expect(
      resolveDatabaseUrl({
        DATABASE_URL: "postgres://a/db",
        POSTGRES_URL: "postgres://b/db",
      }),
    ).toBe("postgres://a/db");
  });

  it("falls back to Vercel/Neon POSTGRES_URL", () => {
    expect(resolveDatabaseUrl({ POSTGRES_URL: " postgres://neon/db " })).toBe("postgres://neon/db");
  });

  it("returns undefined when nothing is set", () => {
    expect(resolveDatabaseUrl({})).toBeUndefined();
  });
});
