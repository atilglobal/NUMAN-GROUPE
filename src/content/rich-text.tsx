import { Fragment, type ReactNode } from "react";

/*
 * Editorial body text uses a small Markdown subset that is parsed here and
 * rendered as React elements. Raw HTML is never interpreted (it shows as
 * text), and only https links become anchors, so stored text cannot inject
 * markup or script.
 *
 *   ## Heading / ### Subheading
 *   - bullet item        1. numbered item
 *   **bold**  *italic*  [label](https://example.org)
 *   blank line = new paragraph
 */

export type RichBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] };

const BULLET = /^[-*]\s+(.*)$/;
const NUMBERED = /^\d{1,3}[.)]\s+(.*)$/;
const HEADING = /^(#{2,3})\s+(.*)$/;

export function parseRichText(source: string | null | undefined): RichBlock[] {
  if (!source) return [];
  const blocks: RichBlock[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) blocks.push({ type: "paragraph", text: paragraph.join("\n") });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: "list", ...list });
    list = null;
  };

  for (const rawLine of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: heading[1].length as 2 | 3, text: heading[2] });
      continue;
    }

    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    const item = bullet ?? numbered;
    if (item) {
      flushParagraph();
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push(item[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** Only absolute https URLs are linked; anything else stays plain text. */
export function safeHref(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const key = `${keyPrefix}-${index++}`;
    const [, bold, italic, label, href] = match;
    if (bold !== undefined) {
      nodes.push(<strong key={key}>{renderInline(bold, key)}</strong>);
    } else if (italic !== undefined) {
      nodes.push(<em key={key}>{renderInline(italic, key)}</em>);
    } else {
      const safe = safeHref(href);
      nodes.push(
        safe ? (
          <a key={key} href={safe} rel="noopener noreferrer nofollow" className="underline underline-offset-4">
            {label}
          </a>
        ) : (
          <Fragment key={key}>{label}</Fragment>
        ),
      );
    }
    last = start + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function RichText({ source, className }: { source: string | null | undefined; className?: string }) {
  const blocks = parseRichText(source);
  if (blocks.length === 0) return null;
  return (
    <div className={className}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              <h2 key={index} className="pt-4 font-serif text-3xl leading-tight text-navy-950">
                {renderInline(block.text, `h${index}`)}
              </h2>
            ) : (
              <h3 key={index} className="pt-2 text-xl font-semibold text-navy-950">
                {renderInline(block.text, `h${index}`)}
              </h3>
            );
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={index} className={`${block.ordered ? "list-decimal" : "list-disc"} space-y-2 pl-6`}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item, `l${index}-${itemIndex}`)}</li>
                ))}
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={index} className="whitespace-pre-line">
                {renderInline(block.text, `p${index}`)}
              </p>
            );
        }
      })}
    </div>
  );
}

export function hasRichText(source: string | null | undefined): boolean {
  return parseRichText(source).length > 0;
}
