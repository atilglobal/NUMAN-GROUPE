import { describe, expect, it } from "vitest";
import { contentTags, tagsForEntity } from "./cache-tags";

describe("public cache tags", () => {
  it("expires project cards and media together", () => {
    expect(tagsForEntity("project")).toEqual([contentTags.projects, contentTags.media]);
  });
});
