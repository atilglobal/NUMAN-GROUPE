import type { Metadata } from "next";
import { listUiStringRows } from "@/admin/ui-strings";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { UiStringsEditor } from "@/components/admin/UiStringsEditor";
import { PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Dil ve çeviri yönetimi" };

export default async function UiStringsPage() {
  await requirePermission("content:write");
  const rows = await listUiStringRows(getDb());

  return (
    <>
      <PageHeader
        title="Dil ve çeviri yönetimi"
        description="Public arayüz metinleri (menü, düğme, form, boş durum). Anahtarlar kilitlidir. Panelde kayıt yoksa kod içindeki varsayılan kullanılır. Editoryal içerikler ilgili modüllerde düzenlenir."
      />
      <UiStringsEditor rows={rows} />
    </>
  );
}
