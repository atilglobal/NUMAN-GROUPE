import { describe, expect, it } from "vitest";
import { DEFAULT_GROUP_LAYOUT, GROUP_SECTION_KEYS, normalizeGroupLayout } from "./group-layout";

describe("normalizeGroupLayout", () => {
  it("fills missing sections and hides quality by default", () => {
    expect(normalizeGroupLayout(null)).toEqual(DEFAULT_GROUP_LAYOUT);
    expect(normalizeGroupLayout([])).toEqual(DEFAULT_GROUP_LAYOUT);
    expect(DEFAULT_GROUP_LAYOUT.find((item) => item.key === "quality")).toEqual({
      key: "quality",
      visible: false,
    });
  });

  it("keeps saved order and drops unknown keys", () => {
    const layout = normalizeGroupLayout([
      { key: "closing", visible: false },
      { key: "unknown", visible: true },
      { key: "hero", visible: false },
      { key: "hero", visible: true },
    ]);
    expect(layout.map((item) => item.key)[0]).toBe("closing");
    expect(layout.map((item) => item.key)[1]).toBe("hero");
    expect(new Set(layout.map((item) => item.key))).toEqual(new Set(GROUP_SECTION_KEYS));
    expect(layout.find((item) => item.key === "hero")).toEqual({ key: "hero", visible: false });
    expect(layout.find((item) => item.key === "closing")).toEqual({ key: "closing", visible: false });
  });
});
