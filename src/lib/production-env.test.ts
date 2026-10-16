import { describe, expect, it } from "vitest";
import { assessProductionEnv } from "./production-env";

describe("assessProductionEnv", () => {
  const complete = {
    DATABASE_URL: "postgres://user:pass@db.internal:5432/numan",
    BETTER_AUTH_SECRET: "a".repeat(32),
    SITE_URL: "https://www.example.com",
    SITE_ENV: "production",
    MEDIA_STORAGE_DIR: "/var/lib/numan/media",
    BETTER_AUTH_URL: "https://www.example.com",
    RESEND_API_KEY: "re_test",
    INQUIRY_NOTIFY_FROM: "NUMAN GROUPE <noreply@example.com>",
    AUTH_IP_HEADER: "x-forwarded-for",
  };

  it("is ready when the durable Node host variables are set", () => {
    const result = assessProductionEnv(complete);
    expect(result.missing).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.ready).toBe(true);
  });

  it("lists missing secrets without echoing their values", () => {
    const result = assessProductionEnv({});
    expect(result.missing).toEqual(["DATABASE_URL", "BETTER_AUTH_SECRET", "SITE_URL"]);
    expect(result.ready).toBe(false);
    expect(JSON.stringify(result)).not.toMatch(/postgres:\/\//);
  });

  it("does not treat an http SITE_URL as a public launch", () => {
    const result = assessProductionEnv({ ...complete, SITE_URL: "http://localhost:3000" });
    expect(result.ready).toBe(false);
    expect(result.warnings.some((item) => item.includes("https"))).toBe(true);
  });
});
