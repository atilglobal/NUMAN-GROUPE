import { describe, expect, it } from "vitest";
import { isPublicMediaKey } from "./storage";

describe("isPublicMediaKey", () => {
  it("always allows stored uploads", () => {
    expect(
      isPublicMediaKey("uploads/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg", { SITE_ENV: "production" }),
    ).toBe(true);
  });

  it("hides demo files when demo content is disabled", () => {
    expect(isPublicMediaKey("demo/hero-stadium.jpg", { SITE_ENV: "production" })).toBe(false);
    expect(isPublicMediaKey("demo/hero-stadium.jpg", { NODE_ENV: "production" })).toBe(false);
  });

  it("serves demo files only when demo content is enabled", () => {
    expect(isPublicMediaKey("demo/hero-stadium.jpg", { NODE_ENV: "development" })).toBe(true);
  });
});
