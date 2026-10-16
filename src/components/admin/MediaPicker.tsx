"use client";

import { useState } from "react";
import { uploadImageAction } from "@/admin/actions/media";
import type { Locale } from "@/i18n/config";
import type { MediaPickerItem } from "@/media/store";
import { ActionForm, FormStatus, SubmitButton, TextField } from "./forms";

export function MediaPicker({
  items,
  coverId,
  galleryIds,
  allowGallery = true,
  withCaptions = false,
  coverName = "coverAssetId",
  coverLabel = "Kapak yap",
  coverSelectedLabel = "Kapak seçili",
}: {
  items: MediaPickerItem[];
  coverId: string | null;
  galleryIds: string[];
  allowGallery?: boolean;
  withCaptions?: boolean;
  coverName?: string;
  coverLabel?: string;
  coverSelectedLabel?: string;
}) {
  const [cover, setCover] = useState(coverId ?? "");
  const [gallery, setGallery] = useState(galleryIds);
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => {
    const haystack = `${item.originalFilename ?? ""} ${item.alts.fr ?? ""} ${item.alts.en ?? ""} ${item.alts.tr ?? ""}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  function toggleGallery(id: string) {
    setGallery((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const captionIds = [...new Set([cover, ...gallery].filter(Boolean))];

  function move(id: string, direction: -1 | 1) {
    setGallery((current) => {
      const index = current.indexOf(id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  return (
    <div className="grid gap-4">
      <input type="hidden" name={coverName} value={cover} />
      {gallery.map((id) => (
        <input key={id} type="hidden" name="gallery" value={id} />
      ))}

      <div>
        <p className="text-sm font-medium text-navy-950">Mevcut görseller</p>
        <p className="mt-1 text-xs text-muted">
          Bir dilde alternatif metni olmayan görsel o dilde sitede gösterilmez.
        </p>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Görsel ara"
          className="mt-3 min-h-10 w-full rounded-md border border-line px-3 text-sm"
        />
        {items.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Henüz görsel yok. Aşağıdan yükleyin.</p>
        ) : filtered.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aramayla eşleşen görsel yok.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => {
              const inGallery = gallery.includes(item.id);
              const isCover = cover === item.id;
              return (
                <li key={item.id} className="overflow-hidden rounded-md border border-line bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt="" className="aspect-[4/3] w-full object-cover" />
                  <div className="grid gap-1 p-2 text-xs">
                    <p className="truncate text-muted">{item.originalFilename ?? item.id}</p>
                    <p className="text-muted">Alt: {altSummary(item.alts)}</p>
                    <button
                      type="button"
                      className={`min-h-8 rounded px-2 ${isCover ? "bg-navy-950 text-paper" : "border border-line"}`}
                      onClick={() => setCover(isCover ? "" : item.id)}
                    >
                      {isCover ? coverSelectedLabel : coverLabel}
                    </button>
                    {allowGallery ? (
                      <button
                        type="button"
                        className={`min-h-8 rounded px-2 ${inGallery ? "bg-paper-2" : "border border-line"}`}
                        onClick={() => toggleGallery(item.id)}
                      >
                        {inGallery ? "Galeriden çıkar" : "Galeriye ekle"}
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {withCaptions && captionIds.length > 0 ? (
        <div className="grid gap-3">
          <p className="text-sm font-medium text-navy-950">Fotoğraf açıklamaları</p>
          <p className="text-xs text-muted">
            Açıklama isteğe bağlıdır. Görsel o dilde yalnızca alternatif metin varsa gösterilir.
          </p>
          {captionIds.map((id) => {
            const item = items.find((entry) => entry.id === id);
            return (
              <fieldset key={id} className="grid gap-2 rounded-md border border-line p-3">
                <legend className="text-xs text-muted">{item?.originalFilename ?? id}</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  <TextField label="Açıklama FR" name={`caption-${id}-fr`} defaultValue={item?.captions.fr ?? ""} maxLength={240} />
                  <TextField label="Açıklama EN" name={`caption-${id}-en`} defaultValue={item?.captions.en ?? ""} maxLength={240} />
                  <TextField label="Açıklama TR" name={`caption-${id}-tr`} defaultValue={item?.captions.tr ?? ""} maxLength={240} />
                </div>
              </fieldset>
            );
          })}
        </div>
      ) : null}

      {allowGallery && gallery.length > 1 ? (
        <div>
          <p className="text-sm font-medium text-navy-950">Galeri sırası</p>
          <ol className="mt-2 grid gap-1">
            {gallery.map((id, index) => {
              const item = items.find((entry) => entry.id === id);
              return (
                <li key={id} className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-muted">{index + 1}.</span>
                  <span className="flex-1 truncate">{item?.originalFilename ?? id}</span>
                  <button type="button" className="min-h-8 rounded border border-line px-2" onClick={() => move(id, -1)}>
                    Yukarı
                  </button>
                  <button type="button" className="min-h-8 rounded border border-line px-2" onClick={() => move(id, 1)}>
                    Aşağı
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

function altSummary(alts: Partial<Record<Locale, string>>) {
  const present = (Object.keys(alts) as Locale[]).filter((locale) => alts[locale]);
  return present.length > 0 ? present.map((locale) => locale.toUpperCase()).join(", ") : "yok";
}

export function MediaUploadForm() {
  return (
    <ActionForm action={uploadImageAction} resetOnSuccess className="grid gap-3 rounded-md border border-dashed border-line p-4">
      <p className="text-sm font-medium text-navy-950">Yeni görsel yükle</p>
      <FormStatus />
      <input
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="text-sm"
        required
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField label="Alt metin (FR)" name="altFr" maxLength={200} />
        <TextField label="Alt metin (EN)" name="altEn" maxLength={200} />
        <TextField label="Alt metin (TR)" name="altTr" maxLength={200} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField label="Açıklama (FR)" name="captionFr" maxLength={240} />
        <TextField label="Açıklama (EN)" name="captionEn" maxLength={240} />
        <TextField label="Açıklama (TR)" name="captionTr" maxLength={240} />
      </div>
      <p className="text-xs text-muted">
        En az bir dilde alternatif metin zorunlu. Açıklama isteğe bağlıdır. JPEG, PNG, WebP veya GIF, en fazla 6 MB.
      </p>
      <div>
        <SubmitButton variant="secondary" pendingLabel="Yükleniyor…">
          Yükle
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
