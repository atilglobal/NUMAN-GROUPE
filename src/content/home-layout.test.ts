import { describe, expect, it } from "vitest";
import { DEFAULT_HOME_LAYOUT, HOME_SECTION_KEYS, normalizeHomeLayout } from "./home-layout";

describe("normalizeHomeLayout", () => {
  it("fills missing sections without inventing extra keys", () => {
    expect(normalizeHomeLayout(null)).toEqual(DEFAULT_HOME_LAYOUT);
    expect(normalizeHomeLayout([])).toEqual(DEFAULT_HOME_LAYOUT);
    expect(normalizeHomeLayout([{ key: "cta", visible: false }, { key: "unknown" }])).toEqual([
      { key: "cta", visible: false },
      ...HOME_SECTION_KEYS.filter((key) => key !== "cta").map((key) => ({ key, visible: true })),
    ]);
  });

  it("drops duplicates and keeps the first order", () => {
    const layout = normalizeHomeLayout([
      { key: "team", visible: true },
      { key: "team", visible: false },
      { key: "hero", visible: false },
    ]);
    expect(layout.map((item) => item.key)[0]).toBe("team");
    expect(layout.map((item) => item.key)[1]).toBe("hero");
    expect(new Set(layout.map((item) => item.key))).toEqual(new Set(HOME_SECTION_KEYS));
    expect(layout.find((item) => item.key === "hero")).toEqual({ key: "hero", visible: false });
    expect(layout.find((item) => item.key === "team")).toEqual({ key: "team", visible: true });
  });
});
