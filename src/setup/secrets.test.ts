import { describe, expect, it } from "vitest";
import { redactSetupError, setupKeysMatch } from "./secrets";

describe("setup secrets", () => {
  it("compares keys without leaking length-only mismatches as equal", () => {
    expect(setupKeysMatch("abcdefghijklmnop", "abcdefghijklmnop")).toBe(true);
    expect(setupKeysMatch("abcdefghijklmnop", "abcdefghijklmnoz")).toBe(false);
    expect(setupKeysMatch("short", "abcdefghijklmnop")).toBe(false);
  });

  it("strips connection strings and env secrets from errors", () => {
    const env = {
      SETUP_KEY: "setup-secret-value-xx",
      DATABASE_URL: "postgres://user:hunter2@db.example:5432/numan",
      BETTER_AUTH_SECRET: "auth-secret-value-xx",
    };
    const raw = "fail postgres://user:hunter2@db.example:5432/numan setup-secret-value-xx auth-secret-value-xx";
    const redacted = redactSetupError(raw, env);
    expect(redacted).not.toContain("hunter2");
    expect(redacted).not.toContain("setup-secret-value");
    expect(redacted).not.toContain("auth-secret-value");
    expect(redacted).toContain("[redacted]");
  });
});
