import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Next `output: "standalone"` does not copy `public` or `.next/static`.
 * The standalone server also chdirs into `.next/standalone`, so demo files
 * used only when demo content is enabled are copied next to that cwd.
 */
const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  if (process.env.VERCEL) {
    console.log("Skipping standalone copy on Vercel.");
    process.exit(0);
  }
  console.error("No .next/standalone output. Run npm run build first.");
  process.exit(1);
}

function copy(from: string, to: string) {
  if (!existsSync(from)) return;
  mkdirSync(path.dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

copy(path.join(root, "public"), path.join(standalone, "public"));
copy(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"));
copy(path.join(root, "content", "demo"), path.join(standalone, "content", "demo"));
console.log("Standalone runtime files copied.");
