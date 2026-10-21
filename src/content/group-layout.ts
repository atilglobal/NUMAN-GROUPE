export const GROUP_SECTION_KEYS = [
  "hero",
  "snapshot",
  "identity",
  "history",
  "mission",
  "vision",
  "sectors",
  "finance",
  "regions",
  "method",
  "principles",
  "organization",
  "quality",
  "future",
  "closing",
] as const;

export type GroupSectionKey = (typeof GROUP_SECTION_KEYS)[number];

export type GroupSectionLayout = { key: GroupSectionKey; visible: boolean };

export const DEFAULT_GROUP_LAYOUT: GroupSectionLayout[] = GROUP_SECTION_KEYS.map((key) => ({
  key,
  visible: key !== "quality",
}));

export function normalizeGroupLayout(value: unknown): GroupSectionLayout[] {
  const incoming = Array.isArray(value) ? value : [];
  const seen = new Set<GroupSectionKey>();
  const ordered: GroupSectionLayout[] = [];
  for (const item of incoming) {
    if (!item || typeof item !== "object") continue;
    const key = (item as { key?: unknown }).key;
    if (!GROUP_SECTION_KEYS.includes(key as GroupSectionKey) || seen.has(key as GroupSectionKey)) continue;
    seen.add(key as GroupSectionKey);
    ordered.push({
      key: key as GroupSectionKey,
      visible: (item as { visible?: unknown }).visible !== false,
    });
  }
  for (const fallback of DEFAULT_GROUP_LAYOUT) {
    if (!seen.has(fallback.key)) ordered.push(fallback);
  }
  return ordered;
}
