import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCmsEditor } from "@/admin/cms";
import { idSchema } from "@/admin/validation";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { listImagesForPicker } from "@/media/store";
import { CmsPageEditor } from "@/components/admin/CmsPageEditor";
import { PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Sayfa düzenle" };

export default async function CmsPageEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content:write");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const page = await getCmsEditor(getDb(), id);
  if (!page) notFound();
  const media = (await listImagesForPicker(getDb())).map((item) => ({
    id: item.id,
    src: item.src,
    label: item.originalFilename ?? item.id,
  }));

  return (
    <>
      <PageHeader title="Sayfayı düzenle" back={{ href: "/admin/icerik-sayfalari", label: "Sayfalar" }} />
      <CmsPageEditor page={page} media={media} />
    </>
  );
}
