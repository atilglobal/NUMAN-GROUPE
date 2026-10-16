import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { idSchema } from "@/admin/validation";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { getMediaForEditor } from "@/media/store";
import { listMediaUsage } from "@/media/usage";
import { FocalPicker } from "@/components/admin/FocalPicker";
import { MediaDeleteForm, MediaTextForm } from "@/components/admin/MediaLibraryForms";
import { Card, PageHeader, Pill } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Medya dosyası" };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function MediaEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("media:write");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const item = await getMediaForEditor(getDb(), id);
  if (!item) notFound();
  const usages = await listMediaUsage(getDb(), id);

  return (
    <>
      <PageHeader
        title={item.originalFilename ?? "Görsel"}
        description="Üç dilde alternatif metin ve açıklama. Bir dilde alt yoksa o dilde sitede gösterilmez."
        back={{ href: "/admin/medya", label: "Kütüphane" }}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <Card>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt={item.alts.fr ?? item.alts.en ?? item.alts.tr ?? ""} className="w-full bg-paper-2" />
          <dl className="mt-4 grid gap-2 text-sm">
            <div>
              <dt className="text-xs text-muted">Boyut</dt>
              <dd>
                {item.width && item.height ? `${item.width} × ${item.height} px · ` : null}
                {formatBytes(item.byteSize)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Tür</dt>
              <dd>{item.mimeType}</dd>
            </div>
            {item.isDemo ? (
              <dd>
                <Pill tone="warning">Demo</Pill>
              </dd>
            ) : null}
          </dl>
        </Card>
        <div className="grid gap-6">
          <Card title="Metinler">
            <MediaTextForm item={item} />
          </Card>
          <Card title="Odak ve kırpma önizlemesi">
            <FocalPicker
              assetId={item.id}
              src={item.src}
              width={item.width}
              height={item.height}
              context={`media:${item.id}:library`}
            />
          </Card>
          <Card title="Kullanıldığı yerler">
            {usages.length === 0 ? (
              <p className="text-sm text-muted">Bu dosya hiçbir içerikte seçili değil.</p>
            ) : (
              <ul className="grid gap-2 text-sm">
                {usages.map((usage) => (
                  <li key={`${usage.kind}-${usage.id}`}>
                    {usage.kind}
                    {usage.label !== usage.id ? ` — ${usage.label}` : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Sil">
            <MediaDeleteForm id={id} usages={usages} />
          </Card>
        </div>
      </div>
    </>
  );
}
