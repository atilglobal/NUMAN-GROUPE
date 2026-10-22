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

export function sectionList(section: ExpertiseSection | undefined): { ordered: boolean; items: string[] } | null {
  const list = section?.blocks.find((block) => block.type === "list");
  return list?.type === "list" ? { ordered: list.ordered, items: list.items } : null;
}

export function expertiseLayout(source: string | null | undefined) {
  const { intro, sections } = splitExpertiseBody(source);
  const scope = sections.find((section) => sectionList(section)?.ordered === false);
  const process = sections.find((section) => sectionList(section)?.ordered === true);
  const priorities = sections.find((section) => section !== scope && section !== process && sectionList(section));
  const extra = sections.filter(
    (section) => section !== scope && section !== priorities && section !== process,
  );
  return { intro, scope, priorities, process, extra };
}

/** Compact foci for the aside: later list first, so the intro is not repeated. */
export function sidebarFocuses(source: string | null | undefined, limit = 4): string[] {
  const { scope, priorities } = expertiseLayout(source);
  const fromPriorities = sectionList(priorities)?.items ?? [];
  const fromScope = sectionList(scope)?.items ?? [];
  const items = fromPriorities.length > 0 ? fromPriorities : fromScope;
  return items.slice(0, limit);
}
