/** Bump when a public reader’s result shape changes so stale Vercel data-cache entries are not reused. */
export const PUBLIC_CONTENT_REV = 5;

export const contentTags = {
  expertises: "content:expertises",
  projects: "content:projects:v2",
  visits: "content:visits",
  team: "content:team",
  pages: "content:pages",
  settings: "content:settings",
  media: "content:media:v2",
  ui: "content:ui",
  menus: "content:menus",
  cms: "content:cms",
} as const;

export type ContentTag = (typeof contentTags)[keyof typeof contentTags];

export type ContentEntity =
  | "expertise"
  | "project"
  | "visit"
  | "team_member"
  | "page"
  | "home"
  | "settings"
  | "media"
  | "ui"
  | "menu"
  | "cms_page";

/**
 * Cache entries a change to `entity` can make stale. Project cards show the
 * expertise name, and every image-bearing read is also tagged with `media`.
 */
export function tagsForEntity(entity: ContentEntity): ContentTag[] {
  switch (entity) {
    case "expertise":
      return [contentTags.expertises, contentTags.projects];
    case "project":
      return [contentTags.projects, contentTags.media];
    case "visit":
      return [contentTags.visits];
    case "team_member":
      return [contentTags.team];
    case "page":
      return [contentTags.pages];
    case "home":
    case "settings":
      return [contentTags.settings];
    case "media":
      return [contentTags.media];
    case "ui":
      return [contentTags.ui];
    case "menu":
      return [contentTags.menus];
    case "cms_page":
      return [contentTags.cms, contentTags.menus, contentTags.pages];
  }
}
