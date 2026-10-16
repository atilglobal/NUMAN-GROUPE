import type { Metadata } from "next";
import { listCmsPages } from "@/admin/cms";
import { getMenuEditor } from "@/admin/menus";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { MenuEditor } from "@/components/admin/MenuEditor";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Menüler" };

export default async function MenusAdminPage() {
  await requirePermission("content:write");
  const db = getDb();
  const [header, footer, pages] = await Promise.all([
    getMenuEditor(db, "header"),
    getMenuEditor(db, "footer"),
    listCmsPages(db),
  ]);
  const pageOptions = pages.map((page) => ({ id: page.id, title: page.title }));

  return (
    <>
      <PageHeader
        title="Menü yönetimi"
        description="Üst ve alt menü. Dahili öğeler sayfa veya bölüm kimliğine bağlıdır; slug değişince kırılmaz. Yayımlanmamış CMS sayfası o dilde gösterilmez."
      />
      <div className="grid gap-8">
        <Card title="Üst menü">
          <MenuEditor location="header" items={header.items} pages={pageOptions} />
        </Card>
        <Card title="Alt menü">
          <MenuEditor location="footer" items={footer.items} pages={pageOptions} />
        </Card>
      </div>
    </>
  );
}
