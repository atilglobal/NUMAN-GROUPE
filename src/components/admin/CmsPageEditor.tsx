"use client";

import { useMemo, useState } from "react";
import {
  deleteCmsPageAction,
  saveCmsLayoutAction,
  saveCmsTranslationAction,
  setCmsStatusFormAction,
} from "@/admin/actions/cms";
import type { CmsEditor } from "@/admin/cms";
import { locales, type Locale } from "@/i18n/config";
import type { CmsBlockCopy, CmsBlockType, CmsLayoutBlock } from "@/db/schema";
import { ActionForm, ConfirmDialog, FormStatus, SubmitButton, TextField } from "./forms";
import { LocaleTabs } from "./LocaleTabs";
import { StatusBadge } from "./ui";

const BLOCK_LABELS: Record<CmsBlockType, string> = {
  hero: "Karşılama",
  richtext: "Zengin metin",
  imageText: "Görsel + metin",
  fullImage: "Tam genişlik görsel",
  gallery: "Fotoğraf galerisi",
  expertises: "Uzmanlık listesi",
  projects: "Proje listesi",
  visits: "Ziyaret listesi",
  team: "Kadro listesi",
  cta: "İletişim çağrısı",
};

export function CmsPageEditor({ page, media }: { page: CmsEditor; media: { id: string; src: string; label: string }[] }) {
  const [layout, setLayout] = useState<CmsLayoutBlock[]>(page.layout);
  const [coverAssetId, setCoverAssetId] = useState(page.coverAssetId ?? "");

  function addBlock(type: CmsBlockType) {
    setLayout((current) => [
      ...current,
      { id: crypto.randomUUID(), type, galleryAssetIds: [], placementContext: `cms:${page.id}:${crypto.randomUUID()}` },
    ]);
  }

  const layoutAction = saveCmsLayoutAction.bind(null, page.id);

  return (
    <div className="grid gap-8">
      <ActionForm action={layoutAction} className="grid gap-4 rounded-lg border border-line bg-white p-5">
        <FormStatus />
        <h2 className="text-base font-semibold">Ortak yerleşim</h2>
        <p className="text-sm text-muted">Blok sırası diller arasında ortaktır. Metinler aşağıdaki dil sekmelerindedir.</p>
        <input type="hidden" name="layout" value={JSON.stringify(layout)} />
        <label className="grid gap-1 text-sm">
          Varsayılan kapak
          <select
            name="coverAssetId"
            value={coverAssetId}
            onChange={(event) => setCoverAssetId(event.target.value)}
            className="min-h-10 rounded border border-line px-3"
          >
            <option value="">Yok</option>
            {media.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <ul className="grid gap-2">
          {layout.map((block, index) => (
            <li key={block.id} className="flex flex-wrap items-center gap-2 rounded border border-line px-3 py-2 text-sm">
              <span className="font-medium">{BLOCK_LABELS[block.type]}</span>
              <button
                type="button"
                className="text-xs underline"
                disabled={index === 0}
                onClick={() =>
                  setLayout((current) => {
                    const next = [...current];
                    [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
                    return next;
                  })
                }
              >
                Yukarı
              </button>
              <button
                type="button"
                className="text-xs underline"
                disabled={index === layout.length - 1}
                onClick={() =>
                  setLayout((current) => {
                    const next = [...current];
                    [next[index + 1], next[index]] = [next[index]!, next[index + 1]!];
                    return next;
                  })
                }
              >
                Aşağı
              </button>
              <button type="button" className="ml-auto text-xs text-red-800 underline" onClick={() => setLayout((current) => current.filter((item) => item.id !== block.id))}>
                Kaldır
              </button>
              {block.type === "gallery" || block.type === "fullImage" || block.type === "imageText" || block.type === "hero" ? (
                <select
                  className="min-h-9 rounded border border-line px-2 text-xs"
                  value={block.imageAssetId ?? ""}
                  onChange={(event) =>
                    setLayout((current) =>
                      current.map((item) => (item.id === block.id ? { ...item, imageAssetId: event.target.value || null } : item)),
                    )
                  }
                >
                  <option value="">Görsel (ortak)</option>
                  {media.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              ) : null}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BLOCK_LABELS) as CmsBlockType[]).map((type) => (
            <button key={type} type="button" className="rounded border border-line px-3 py-1 text-xs" onClick={() => addBlock(type)}>
              + {BLOCK_LABELS[type]}
            </button>
          ))}
        </div>
        <SubmitButton>Yerleşimi kaydet</SubmitButton>
      </ActionForm>

      <LocaleTabs
        label="Sayfa dilleri"
        tabs={locales.map((locale) => {
          const row = page.translations[locale];
          return {
            id: locale,
            label: locale.toUpperCase(),
            status: <StatusBadge state={row?.status ?? "missing"} />,
            content: (
              <TranslationPanel
                pageId={page.id}
                locale={locale}
                layout={layout}
                initial={row}
              />
            ),
          };
        })}
      />

      <ConfirmDialog
        triggerLabel="Sayfayı sil"
        title="Sayfayı sil"
        description={<p>Üç dildeki içerik ve menü bağlantıları kalkar. Geri alınamaz.</p>}
        confirmLabel="Sil"
        action={deleteCmsPageAction.bind(null, page.id)}
      />
    </div>
  );
}

function TranslationPanel({
  pageId,
  locale,
  layout,
  initial,
}: {
  pageId: string;
  locale: Locale;
  layout: CmsLayoutBlock[];
  initial?: NonNullable<CmsEditor["translations"][Locale]>;
}) {
  const [blocks, setBlocks] = useState<Record<string, CmsBlockCopy>>(initial?.blocks ?? {});
  const action = useMemo(() => saveCmsTranslationAction.bind(null, pageId, locale), [pageId, locale]);

  return (
    <div className="grid gap-4">
    <ActionForm action={action} className="grid gap-4">
      <FormStatus />
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
      <TextField label="Başlık" name="title" required defaultValue={initial?.title ?? ""} maxLength={180} />
      <TextField label="Bağlantı adı (slug)" name="slug" required defaultValue={initial?.slug ?? ""} maxLength={160} />
      <TextField label="Kısa açıklama" name="summary" defaultValue={initial?.summary ?? ""} maxLength={400} />
      <TextField label="SEO başlığı" name="seoTitle" defaultValue={initial?.seoTitle ?? ""} maxLength={70} />
      <TextField label="SEO açıklaması" name="seoDescription" defaultValue={initial?.seoDescription ?? ""} maxLength={160} />
      <TextField label="Sosyal başlık" name="ogTitle" defaultValue={initial?.ogTitle ?? ""} maxLength={90} />
      <TextField label="Sosyal açıklama" name="ogDescription" defaultValue={initial?.ogDescription ?? ""} maxLength={180} />
      {layout.map((block) => (
        <fieldset key={block.id} className="grid gap-2 rounded border border-line p-3">
          <legend className="px-1 text-sm font-medium">{BLOCK_LABELS[block.type]}</legend>
          <input
            className="rounded border border-line px-3 py-2 text-sm"
            placeholder="Başlık"
            value={blocks[block.id]?.title ?? ""}
            onChange={(event) => setBlocks((current) => ({ ...current, [block.id]: { ...current[block.id], title: event.target.value } }))}
          />
          <textarea
            className="rounded border border-line px-3 py-2 text-sm"
            rows={4}
            placeholder="Metin (Markdown: ## başlık, liste, **kalın**)"
            value={blocks[block.id]?.body ?? ""}
            onChange={(event) => setBlocks((current) => ({ ...current, [block.id]: { ...current[block.id], body: event.target.value } }))}
          />
          <input
            className="rounded border border-line px-3 py-2 text-sm"
            placeholder="Düğme metni"
            value={blocks[block.id]?.ctaLabel ?? ""}
            onChange={(event) => setBlocks((current) => ({ ...current, [block.id]: { ...current[block.id], ctaLabel: event.target.value } }))}
          />
          <input
            className="rounded border border-line px-3 py-2 text-sm"
            placeholder="Görsel alternatif metni (bu kullanım)"
            value={blocks[block.id]?.imageAlt ?? ""}
            onChange={(event) => setBlocks((current) => ({ ...current, [block.id]: { ...current[block.id], imageAlt: event.target.value } }))}
          />
        </fieldset>
      ))}
      <div className="flex flex-wrap gap-2">
        <SubmitButton>Bu dili kaydet</SubmitButton>
        {initial ? (
          <a className="rounded border border-line px-3 py-2 text-sm" href={`/admin/onizleme/icerik-sayfalari/${pageId}?dil=${locale}`}>
            Önizleme
          </a>
        ) : null}
      </div>
    </ActionForm>
      {initial ? (
        <form action={setCmsStatusFormAction.bind(null, pageId, locale, initial.status === "published" ? "draft" : "published")}>
          <button type="submit" className="rounded border border-line px-3 py-2 text-sm">
            {initial.status === "published" ? "Yayından kaldır" : "Yayımla"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
