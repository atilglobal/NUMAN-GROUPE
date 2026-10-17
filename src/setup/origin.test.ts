import { describe, expect, it } from "vitest";
import { isTrustedSetupOrigin } from "./origin";

function headers(init: Record<string, string>) {
  return new Headers(init);
}

describe("isTrustedSetupOrigin", () => {
  it("accepts a matching Origin and Host", () => {
    expect(
      isTrustedSetupOrigin(headers({ origin: "https://numan-groupe.vercel.app", host: "numan-groupe.vercel.app" })),
    ).toBe(true);
  });

  it("accepts x-forwarded-host when present", () => {
    expect(
      isTrustedSetupOrigin(
        headers({
          origin: "https://numan-groupe.vercel.app",
          host: "localhost",
          "x-forwarded-host": "numan-groupe.vercel.app",
        }),
      ),
    ).toBe(true);
  });

  it("rejects a missing origin or a different host", () => {
    expect(isTrustedSetupOrigin(headers({ host: "numan-groupe.vercel.app" }))).toBe(false);
    expect(
      isTrustedSetupOrigin(headers({ origin: "https://evil.example", host: "numan-groupe.vercel.app" })),
    ).toBe(false);
  });
});
