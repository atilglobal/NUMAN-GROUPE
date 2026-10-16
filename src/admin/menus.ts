import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { cmsPages, menuItems, menuItemTranslations, menus } from "@/db/schema";
import { locales, type Locale } from "@/i18n/config";
import { sections, type Section } from "@/i18n/routes";
import { writeAudit } from "./audit";
import { AdminRuleError } from "./users";

type Actor = { id: string; ip?: string | null };

export type MenuEditorItem = {
  id: string;
  parentId: string | null;
  sortOrder: number;
  kind: "section" | "cms_page" | "url";
  sectionKey: string | null;
  cmsPageId: string | null;
  externalUrl: string | null;
  labels: Partial<Record<Locale, string>>;
};

export async function ensureMenus(db: Database): Promise<void> {
  const rows = await db.select().from(menus);
  if (!rows.some((row) => row.location === "header")) {
    await db.insert(menus).values({ location: "header" });
  }
  if (!rows.some((row) => row.location === "footer")) {
    await db.insert(menus).values({ location: "footer" });
  }
}

export async function getMenuEditor(db: Database, location: "header" | "footer"): Promise<{
  menuId: string;
  items: MenuEditorItem[];
}> {
  await ensureMenus(db);
  const [menu] = await db.select().from(menus).where(eq(menus.location, location));
  const items = await db.select().from(menuItems).where(eq(menuItems.menuId, menu.id));
  const labels = await db.select().from(menuItemTranslations);
  return {
    menuId: menu.id,
    items: items
      .map((item) => ({
        id: item.id,
        parentId: item.parentId,
        sortOrder: item.sortOrder,
        kind: item.kind,
        sectionKey: item.sectionKey,
        cmsPageId: item.cmsPageId,
        externalUrl: item.externalUrl,
        labels: Object.fromEntries(
          labels.filter((row) => row.itemId === item.id).map((row) => [row.locale, row.label]),
        ),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export async function replaceMenu(
  db: Database,
  actor: Actor,
  location: "header" | "footer",
  items: MenuEditorItem[],
): Promise<void> {
  await ensureMenus(db);
  const [menu] = await db.select().from(menus).where(eq(menus.location, location));
  if (items.some((item) => item.parentId && items.find((parent) => parent.id === item.parentId)?.parentId)) {
    throw new AdminRuleError("Menü en fazla bir alt düzey olabilir.");
  }
  for (const item of items) {
    const filled = locales.filter((locale) => item.labels[locale]?.trim());
    if (filled.length === 0) throw new AdminRuleError("Her öğenin en az bir dilde etiketi olmalıdır.");
    if (item.kind === "section" && !(sections as readonly string[]).includes(item.sectionKey ?? "")) {
      throw new AdminRuleError("Geçersiz sayfa bölümü.");
    }
    if (item.kind === "url") {
      if (!item.externalUrl?.startsWith("https://")) throw new AdminRuleError("Harici bağlantı yalnızca https olabilir.");
    }
    if (item.kind === "cms_page") {
      if (!item.cmsPageId) throw new AdminRuleError("Sayfa seçin.");
      const [page] = await db.select({ id: cmsPages.id }).from(cmsPages).where(eq(cmsPages.id, item.cmsPageId));
      if (!page) throw new AdminRuleError("Seçilen sayfa yok.");
    }
  }

  await db.transaction(async (tx) => {
    await tx.delete(menuItems).where(eq(menuItems.menuId, menu.id));
    const ordered = [...items].sort((a, b) => Number(Boolean(a.parentId)) - Number(Boolean(b.parentId)));
    for (const item of ordered) {
      await tx.insert(menuItems).values({
        id: item.id,
        menuId: menu.id,
        parentId: item.parentId,
        sortOrder: item.sortOrder,
        kind: item.kind,
        sectionKey: item.kind === "section" ? item.sectionKey : null,
        cmsPageId: item.kind === "cms_page" ? item.cmsPageId : null,
        externalUrl: item.kind === "url" ? item.externalUrl : null,
      });
      const labelRows = locales
        .map((locale) => ({ locale, label: item.labels[locale]?.trim() ?? "" }))
        .filter((row) => row.label);
      if (labelRows.length) {
        await tx.insert(menuItemTranslations).values(
          labelRows.map((row) => ({ itemId: item.id, locale: row.locale, label: row.label })),
        );
      }
    }
    await writeAudit(tx, {
      actorUserId: actor.id,
      action: "menu.update",
      entityType: "menu",
      entityId: location,
      ip: actor.ip,
    });
  });
}

export const menuSectionOptions: { value: Section; label: string }[] = [
  { value: "about", label: "Hakkımızda" },
  { value: "expertises", label: "Uzmanlıklar" },
  { value: "projects", label: "Projeler" },
  { value: "visits", label: "Resmî ziyaretler" },
  { value: "team", label: "Kadro" },
  { value: "contact", label: "İletişim" },
  { value: "privacy", label: "Gizlilik" },
  { value: "legal", label: "Yasal" },
  { value: "cookies", label: "Çerezler" },
];
