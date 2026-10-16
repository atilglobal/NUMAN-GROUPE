import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/auth/session";
import { getDb } from "@/db/client";
import { listMediaLibrary } from "@/media/store";
import { MediaUploadForm } from "@/components/admin/MediaPicker";
import { Card, EmptyState, PageHeader, Pager, Pill } from "@/components/admin/ui";
import { buttonClass } from "@/components/admin/button-styles";

export const metadata: Metadata = { title: "Medya kütüphanesi" };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("media:write");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Number(params.page ?? 1);
  const { rows, total, page: current, pageSize } = await listMediaLibrary(getDb(), { q: q || undefined, page });
  const href = (nextPage: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (nextPage > 1) search.set("page", String(nextPage));
    const query = search.toString();
    return `/admin/medya${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Medya kütüphanesi"
        description="Yükleme gerçek dosya türüne bakar; SVG ve çalıştırılabilir dosyalar reddedilir. Adlar rastgele üretilir."
      />
      <div className="grid gap-6">
        <Card title="Yükle">
          <MediaUploadForm />
        </Card>
        <Card title="Dosyalar">
          <form method="get" className="mb-4 flex flex-wrap gap-3">
            <input
              name="q"
              defaultValue={q}
              placeholder="Ara (dosya adı veya alt metin)"
              className="min-h-10 min-w-56 flex-1 rounded-md border border-line px-3 text-sm"
            />
            <button type="submit" className={buttonClass("secondary")}>
              Ara
            </button>
          </form>
          {rows.length === 0 ? (
            <EmptyState title={q ? "Sonuç yok" : "Henüz görsel yok"}>
              {q ? "Aramayı temizleyin." : "JPEG, PNG, WebP veya GIF yükleyin."}
            </EmptyState>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((item) => (
                <li key={item.id} className="overflow-hidden rounded-md border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt="" className="aspect-[4/3] w-full bg-paper-2 object-cover" />
                  <div className="grid gap-1 p-3 text-sm">
                    <Link href={`/admin/medya/${item.id}`} className="font-medium text-navy-950 underline-offset-4 hover:underline">
                      {item.originalFilename ?? item.id}
                    </Link>
                    <p className="text-xs text-muted">
                      {item.width && item.height ? `${item.width}×${item.height} · ` : null}
                      {formatBytes(item.byteSize)} · {item.mimeType.replace("image/", "")}
                    </p>
                    <p className="text-xs text-muted">
                      Alt:{" "}
                      {(["fr", "en", "tr"] as const)
                        .filter((locale) => item.alts[locale])
                        .map((locale) => locale.toUpperCase())
                        .join(", ") || "yok"}
                    </p>
                    {item.isDemo ? <Pill tone="warning">Demo</Pill> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Pager page={current} pageSize={pageSize} total={total} href={href} />
        </Card>
      </div>
    </>
  );
}
