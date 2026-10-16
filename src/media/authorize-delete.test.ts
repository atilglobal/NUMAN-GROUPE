import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("in-use media deletion", () => {
  it("does not offer a force-delete checkbox in the panel", () => {
    const source = readFileSync(path.join(process.cwd(), "src/components/admin/MediaLibraryForms.tsx"), "utf8");
    expect(source).not.toMatch(/name="force"/);
    const action = readFileSync(path.join(process.cwd(), "src/admin/actions/media.ts"), "utf8");
    expect(action).toMatch(/Kullanımdaki medya silinemez/);
  });
});
