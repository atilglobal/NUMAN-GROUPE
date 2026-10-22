import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "docs", "backups", "alfa-visits", "unzipped", "word");
const xml = readFileSync(path.join(root, "document.xml"), "utf8");
const rels = readFileSync(path.join(root, "_rels", "document.xml.rels"), "utf8");

const relMap = new Map<string, string>();
for (const match of rels.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g)) {
  relMap.set(match[1]!, match[2]!.replace(/^media\//, "").replace(/.*\//, ""));
}

const paragraphs = xml.split(/<\/w:p>/);
const blocks: { kind: "text" | "image"; value: string }[] = [];
for (const raw of paragraphs) {
  const texts = [...raw.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((item) => item[1] ?? "");
  const text = texts.join("").replace(/\s+/g, " ").trim();
  const images = [...raw.matchAll(/r:embed="(rId\d+)"/g)].map((item) => relMap.get(item[1]!) ?? item[1]!);
  if (text) blocks.push({ kind: "text", value: text });
  for (const image of images) blocks.push({ kind: "image", value: image });
}

writeFileSync(
  path.join(process.cwd(), "docs", "backups", "alfa-visits", "sequence.json"),
  `${JSON.stringify(blocks, null, 2)}\n`,
  "utf8",
);
console.log(`blocks=${blocks.length} images=${blocks.filter((item) => item.kind === "image").length}`);
for (const [index, block] of blocks.entries()) {
  const mark = block.kind === "image" ? "IMG" : "TXT";
  console.log(`${String(index).padStart(3, "0")} ${mark} ${block.value.slice(0, 180)}`);
}
