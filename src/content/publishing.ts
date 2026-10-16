import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import {
  auditLogs,
  expertiseTranslations,
  officialVisitTranslations,
  cmsPageTranslations,
  pageContentTranslations,
  projectTranslations,
  siteSettingTranslations,
  teamMemberTranslations,
  type PublicationStatus,
} from "@/db/schema";
import type { Locale } from "@/i18n/config";
import { refreshPublicContent } from "./revalidate";

export type TranslatableEntity =
  | "expertise"
  | "project"
  | "visit"
  | "team_member"
  | "page"
  | "home"
  | "cms_page";

export class TranslationNotFoundError extends Error {
  constructor(entity: TranslatableEntity, entityId: string, locale: Locale) {
    super(`No ${locale} translation for ${entity} ${entityId}`);
    this.name = "TranslationNotFoundError";
  }
}

type StatusInput = {
  entity: TranslatableEntity;
  entityId: string;
  locale: Locale;
  status: PublicationStatus;
  actorUserId: string | null;
  ip?: string | null;
};

async function updateStatus(
  tx: Database,
  { entity, entityId, locale, status }: StatusInput,
): Promise<boolean> {
  const values = status === "published" ? { status, publishedAt: new Date() } : { status };

  switch (entity) {
    case "expertise": {
      const t = expertiseTranslations;
      const rows = await tx
        .update(t)
        .set(values)
        .where(and(eq(t.expertiseId, entityId), eq(t.locale, locale)))
        .returning({ id: t.id });
      return rows.length > 0;
    }
    case "project": {
      const t = projectTranslations;
      const rows = await tx
        .update(t)
        .set(values)
        .where(and(eq(t.projectId, entityId), eq(t.locale, locale)))
        .returning({ id: t.id });
      return rows.length > 0;
    }
    case "visit": {
      const t = officialVisitTranslations;
      const rows = await tx
        .update(t)
        .set(values)
        .where(and(eq(t.visitId, entityId), eq(t.locale, locale)))
        .returning({ id: t.id });
      return rows.length > 0;
    }
    case "team_member": {
      const t = teamMemberTranslations;
      const rows = await tx
        .update(t)
        .set(values)
        .where(and(eq(t.memberId, entityId), eq(t.locale, locale)))
        .returning({ id: t.id });
      return rows.length > 0;
    }
    case "page": {
      const t = pageContentTranslations;
      const rows = await tx
        .update(t)
        .set(values)
        .where(and(eq(t.pageId, entityId), eq(t.locale, locale)))
        .returning({ id: t.id });
      return rows.length > 0;
    }
    case "home": {
      const t = siteSettingTranslations;
      const rows = await tx
        .update(t)
        .set(values)
        .where(and(eq(t.settingsId, 1), eq(t.locale, locale)))
        .returning({ id: t.id });
      return rows.length > 0;
    }
    case "cms_page": {
      const t = cmsPageTranslations;
      const rows = await tx
        .update(t)
        .set(values)
        .where(and(eq(t.pageId, entityId), eq(t.locale, locale)))
        .returning({ id: t.id });
      return rows.length > 0;
    }
  }
}

/**
 * Publish or unpublish one language of an entry. Other languages are left
 * untouched; the change is audited and the public cache refreshed.
 */
export async function setTranslationStatus(db: Database, input: StatusInput): Promise<void> {
  await db.transaction(async (tx) => {
    const updated = await updateStatus(tx, input);
    if (!updated) throw new TranslationNotFoundError(input.entity, input.entityId, input.locale);

    await tx.insert(auditLogs).values({
      actorUserId: input.actorUserId,
      action: `${input.entity}.${input.status === "published" ? "publish" : "unpublish"}`,
      entityType: input.entity,
      entityId: input.entityId,
      metadata: { locale: input.locale },
      ip: input.ip ?? null,
    });
  });

  refreshPublicContent(input.entity);
}
