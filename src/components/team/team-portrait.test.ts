import { describe, expect, it } from "vitest";
import { teamPortraitFit } from "./TeamPortrait";
import type { ResolvedImage } from "@/content/types";

function photo(width: number | null, height: number | null): ResolvedImage {
  return {
    src: "/media/x.jpg",
    alt: "x",
    width,
    height,
    caption: null,
    isDemo: false,
  };
}

describe("teamPortraitFit", () => {
  it("covers portraits close to 4:5", () => {
    expect(teamPortraitFit(photo(800, 1000))).toBe("cover");
    expect(teamPortraitFit(photo(640, 800))).toBe("cover");
  });

  it("contains wide or very tall files so faces are not cropped", () => {
    expect(teamPortraitFit(photo(1600, 900))).toBe("contain");
    expect(teamPortraitFit(photo(600, 1200))).toBe("contain");
  });

  it("contains when dimensions are unknown", () => {
    expect(teamPortraitFit(photo(null, null))).toBe("contain");
  });
});
