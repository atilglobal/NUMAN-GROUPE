import { parseRichText, type RichBlock } from "./rich-text";

export type ExpertiseSection = {
  title: string;
  blocks: RichBlock[];
};

export function splitExpertiseBody(source: string | null | undefined): {
  intro: RichBlock[];
  sections: ExpertiseSection[];
} {
  const blocks = parseRichText(source);
  const intro: RichBlock[] = [];
  const sections: ExpertiseSection[] = [];
  let current: ExpertiseSection | null = null;

  for (const block of blocks) {
    if (block.type === "heading" && block.level === 2) {
      current = { title: block.text, blocks: [] };
      sections.push(current);
      continue;
    }
    if (current) current.blocks.push(block);
    else intro.push(block);
  }

  return { intro, sections };
}

export function wordCount(source: string): number {
  return source
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Paragraphs that appear before the first level-2 heading. */
export function introMarkdown(source: string): string {
  const cut = source.search(/^##\s+/m);
  return (cut === -1 ? source : source.slice(0, cut)).trim();
}
