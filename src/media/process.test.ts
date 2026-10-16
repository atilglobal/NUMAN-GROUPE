import { describe, expect, it } from "vitest";
import { resolutionWarning } from "./profiles";
import { assertSafeDimensions, MediaProcessError } from "./process";

describe("media profiles", () => {
  it("warns when a card image is too small", () => {
    expect(resolutionWarning(120, 80, "projectCard")).toMatch(/önerilir/);
    expect(resolutionWarning(1600, 1200, "projectCard")).toBeNull();
  });

  it("rejects oversized pixel buffers", () => {
    expect(() => assertSafeDimensions(20_000, 20_000)).toThrow(MediaProcessError);
  });
});
