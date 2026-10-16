import { describe, expect, it } from "vitest";
import { authTrustedOrigins } from "./config";

describe("authTrustedOrigins", () => {
  it("normalises SITE_URL and Vercel hostnames to origins", () => {
    expect(
      authTrustedOrigins({
        SITE_URL: "https://www.example.com/fr",
        VERCEL_URL: "numan-groupe.vercel.app",
      }).sort(),
    ).toEqual(["https://numan-groupe.vercel.app", "https://www.example.com"]);
  });

  it("skips empty and invalid values", () => {
    expect(authTrustedOrigins({ SITE_URL: "   ", VERCEL_URL: "not a host" })).toEqual([]);
  });
});
