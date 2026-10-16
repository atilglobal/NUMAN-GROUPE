import { and, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { uiStringOverrides } from "@/db/schema";
import { locales, type Locale } from "@/i18n/config";
import { catalogEntry, isUiStringKey, uiCatalog, type CatalogEntry } from "@/i18n/catalog";
import { placeholdersMatch } from "@/i18n/placeholders";
import { writeAudit } from "./audit";
import { AdminRuleError } from "./users";

type Actor = { id: string; ip?: string | null };

export type UiOverrideRow = CatalogEntry & {
  values: Record<Locale, string | null>;
  dirtyDefaults: Record<Locale, boolean>;
};

export async function listUiStringRows(db: Database): Promise<UiOverrideRow[]> {
  const rows = await db.select().from(uiStringOverrides);
  return uiCatalog.map((entry) => {
    const values = Object.fromEntries(
      locales.map((locale) => {
        const found = rows.find((row) => row.key === entry.key && row.locale === locale);
        return [locale, found?.value ?? null];
      }),
    ) as Record<Locale, string | null>;
    const dirtyDefaults = Object.fromEntries(
      locales.map((locale) => [locale, values[locale] !== null && values[locale] !== entry.defaults[locale]]),
    ) as Record<Locale, boolean>;
    return { ...entry, values, dirtyDefaults };
  });
}

export async function saveUiString(
  db: Database,
  actor: Actor,
  key: string,
  locale: Locale,
  value: string,
): Promise<void> {
  if (!isUiStringKey(key)) throw new AdminRuleError("Bu çeviri anahtarı değiştirilemez.");
  const entry = catalogEntry(key);
  if (!entry) throw new AdminRuleError("Bilinmeyen anahtar.");
  const trimmed = value.trim();
  if (!trimmed) throw new AdminRuleError("Arayüz metni boş kaydedilemez.");
  if (!placeholdersMatch(entry.defaults[locale], trimmed)) {
    throw new AdminRuleError("Yer tutucular varsayılan metindekiyle aynı olmalıdır (ör. {count}, {name}).");
  }
  await db
    .insert(uiStringOverrides)
    .values({ key, locale, value: trimmed, updatedById: actor.id })
    .onConflictDoUpdate({
      target: [uiStringOverrides.key, uiStringOverrides.locale],
      set: { value: trimmed, updatedById: actor.id, updatedAt: new Date() },
    });
  await writeAudit(db, {
    actorUserId: actor.id,
    action: "ui.update",
    entityType: "ui",
    entityId: key,
    metadata: { locale },
    ip: actor.ip,
  });
}

export async function restoreUiString(db: Database, actor: Actor, key: string, locale: Locale): Promise<void> {
  if (!isUiStringKey(key)) throw new AdminRuleError("Bu çeviri anahtarı değiştirilemez.");
  await db
    .delete(uiStringOverrides)
    .where(and(eq(uiStringOverrides.key, key), eq(uiStringOverrides.locale, locale)));
  await writeAudit(db, {
    actorUserId: actor.id,
    action: "ui.restore",
    entityType: "ui",
    entityId: key,
    metadata: { locale },
    ip: actor.ip,
  });
}
