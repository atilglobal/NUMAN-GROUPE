import { describe, expect, it } from "vitest";
import { isDemoContentEnabled } from "./demo-policy";

describe("demo policy", () => {
  it("is never enabled when SITE_ENV is production", () => {
    expect(
      isDemoContentEnabled({ SITE_ENV: "production", ALLOW_DEMO_CONTENT: "true", NODE_ENV: "development" }),
    ).toBe(false);
  });

  it("is off by default in production builds", () => {
    expect(isDemoContentEnabled({ NODE_ENV: "production" })).toBe(false);
  });

  it("can be enabled explicitly for a non-production preview", () => {
    expect(isDemoContentEnabled({ NODE_ENV: "production", ALLOW_DEMO_CONTENT: "true" })).toBe(true);
  });

  it("is on in development unless explicitly disabled", () => {
    expect(isDemoContentEnabled({ NODE_ENV: "development" })).toBe(true);
    expect(isDemoContentEnabled({ NODE_ENV: "development", ALLOW_DEMO_CONTENT: "false" })).toBe(false);
  });
});
