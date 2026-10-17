export const HOME_SECTION_KEYS = [
  "hero",
  "intro",
  "process",
  "expertises",
  "projects",
  "visits",
  "team",
  "cta",
] as const;

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export type HomeSectionLayout = { key: HomeSectionKey; visible: boolean };

export const DEFAULT_HOME_LAYOUT: HomeSectionLayout[] = HOME_SECTION_KEYS.map((key) => ({
  key,
  visible: true,
}));

export function normalizeHomeLayout(value: unknown): HomeSectionLayout[] {
  const incoming = Array.isArray(value) ? value : [];
  const seen = new Set<HomeSectionKey>();
  const ordered: HomeSectionLayout[] = [];
  for (const item of incoming) {
    if (!item || typeof item !== "object") continue;
    const key = (item as { key?: unknown }).key;
    if (!HOME_SECTION_KEYS.includes(key as HomeSectionKey) || seen.has(key as HomeSectionKey)) continue;
    seen.add(key as HomeSectionKey);
    ordered.push({
      key: key as HomeSectionKey,
      visible: (item as { visible?: unknown }).visible !== false,
    });
  }
  for (const key of HOME_SECTION_KEYS) {
    if (!seen.has(key)) ordered.push({ key, visible: true });
  }
  return ordered;
}
