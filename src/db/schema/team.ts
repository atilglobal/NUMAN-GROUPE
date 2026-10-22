import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  httpsUrl,
  id,
  notBlank,
  publication,
  publishedAtCheck,
  timestamps,
} from "./common";
import { mediaAssets } from "./media";

export const teamMembers = pgTable(
  "team_members",
  {
    id: id(),
    fullName: text("full_name").notNull(),
    photoAssetId: uuid("photo_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    presentationGroup: text("presentation_group"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
    isDemo: boolean("is_demo").default(false).notNull(),
    ...timestamps(),
  },
  (t) => [
    index("team_members_listing").on(t.isVisible, t.sortOrder),
    notBlank("team_members_full_name", t.fullName),
    check(
      "team_members_presentation_group",
      sql`${t.presentationGroup} is null or ${t.presentationGroup} in ('leadership', 'international', 'technical', 'legal', 'finance')`,
    ),
  ],
);

export const teamMemberTranslations = pgTable(
  "team_member_translations",
  {
    id: id(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
    roleTitle: text("role_title").notNull(),
    summary: text("summary"),
    bio: text("bio"),
    ...publication(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("team_member_translations_entity_locale").on(t.memberId, t.locale),
    publishedAtCheck("team_member_translations", t.status, t.publishedAt),
    notBlank("team_member_translations_role", t.roleTitle),
  ],
);

/** Optional professional links (LinkedIn, personal site…); no contact details by default. */
export const teamMemberLinks = pgTable(
  "team_member_links",
  {
    id: id(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => [
    index("team_member_links_member").on(t.memberId),
    notBlank("team_member_links_label", t.label),
    httpsUrl("team_member_links_url", t.url),
  ],
);
