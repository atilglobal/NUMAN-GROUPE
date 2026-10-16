import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/*
 * A plain function or value exported from a "use client" module becomes a
 * client reference on the server: calling it there throws at render time.
 * Client modules may therefore export only components and hooks (and types).
 */

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const clientFiles = sourceFiles(path.join(process.cwd(), "src")).filter((file) =>
  /^\s*["']use client["']/.test(readFileSync(file, "utf8")),
);

describe("client module exports", () => {
  it("finds the client modules", () => {
    expect(clientFiles.length).toBeGreaterThan(0);
  });

  it.each(clientFiles.map((file) => [path.relative(process.cwd(), file), file]))(
    "%s exports only components and hooks",
    (_name, file) => {
      const source = readFileSync(file, "utf8");
      const exported = [...source.matchAll(/^export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|class)\s+(\w+)/gm)].map(
        (match) => match[1],
      );
      const offending = exported.filter((name) => !/^[A-Z]/.test(name) && !/^use[A-Z]/.test(name));
      expect(offending).toEqual([]);
    },
  );
});
