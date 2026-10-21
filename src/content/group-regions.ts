import { parseRichText } from "./rich-text";

export type GroupRegionColumn = { title: string; body: string };

/** Split a CMS regions body into Africa / Asia / Europe columns from ## headings. */
export function regionColumns(source: string | null | undefined): GroupRegionColumn[] {
  const columns: GroupRegionColumn[] = [];
  for (const block of parseRichText(source)) {
    if (block.type === "heading") {
      columns.push({ title: block.text, body: "" });
      continue;
    }
    const current = columns.at(-1);
    if (!current) continue;
    if (block.type === "paragraph") {
      current.body = current.body ? `${current.body}\n\n${block.text}` : block.text;
    }
  }
  return columns.filter((column) => column.title.trim());
}
