"use client";

import { useState } from "react";
import { uploadImageAction } from "@/admin/actions/media";
import { buttonClass } from "./button-styles";
import type { Locale } from "@/i18n/config";
import type { MediaPickerItem } from "@/media/store";
import { ActionForm, FormStatus, SubmitButton, TextField, useFormState } from "./forms";

export function MediaPicker({
  items,
  coverId,
  galleryIds,
  allowGallery = true,
  withCaptions = false,
  withCopy = false,
  galleryMax = 24,
  coverName = "coverAssetId",
  coverLabel = "Kapak yap",
  coverSelectedLabel = "Kapak seçili",
}: {
  items: MediaPickerItem[];
  coverId: string | null;
  galleryIds: string[];
  allowGallery?: boolean;
  withCaptions?: boolean;
  withCopy?: boolean;
  galleryMax?: number;
  coverName?: string;
  coverLabel?: string;
  coverSelectedLabel?: string;
}) {
  const [cover, setCover] = useState(coverId ?? "");
  const [gallery, setGallery] = useState(galleryIds);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => {
    const haystack = `${item.originalFilename ?? ""} ${item.alts.fr ?? ""} ${item.alts.en ?? ""} ${item.alts.tr ?? ""}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  function toggleGallery(id: string) {
    setGallery((current) => {
      if (current.includes(id)) {
        setLimitMessage(null);
        return current.filter((item) => item !== id);
      }
      if (current.length >= galleryMax) {
        setLimitMessage(`Galeride en fazla ${galleryMax} görsel olabilir.`);
        return current;
      }
      setLimitMessage(null);
      return [...current, id];
    });
  }

  const formState = useFormState();
  const coverError = formState.state.fieldErrors?.coverAssetId;
  const galleryError = formState.state.fieldErrors?.gallery;
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
        {allowGallery ? (
          <p className="mt-1 text-sm text-navy-950">
            Seçilen fotoğraf: {gallery.length} / {galleryMax}
          </p>
        ) : null}
        {limitMessage ? <p className="mt-1 text-sm text-red-700">{limitMessage}</p> : null}
        {coverError ? <p className="mt-1 text-sm text-red-700">{coverError}</p> : null}
        {galleryError ? <p className="mt-1 text-sm text-red-700">{galleryError}</p> : null}
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
                  <img src={item.src} alt="" className="aspect-[4/3] w-full bg-navy-950 object-contain" />
                  <div className="grid gap-1 p-2 text-xs">
                    <p className="truncate text-muted">{item.originalFilename ?? item.id}</p>
                    {item.width && item.height ? (
                      <p className="text-muted">
                        {item.width}×{item.height} px
                      </p>
                    ) : null}
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
                        disabled={!inGallery && gallery.length >= galleryMax}
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

      {(withCaptions || withCopy) && captionIds.length > 0 ? (
        <div className="grid gap-3">
          <p className="text-sm font-medium text-navy-950">
            {withCopy ? "Görsel alternatif metinleri ve açıklamaları" : "Fotoğraf açıklamaları"}
          </p>
          <p className="text-xs text-muted">
            Görseller üç dilde ortaktır. Alternatif metin ve açıklama dile göredir; boş bırakılan dil mevcut metni silmez.
          </p>
          {captionIds.map((id) => {
            const item = items.find((entry) => entry.id === id);
            return (
              <fieldset key={id} className="grid gap-2 rounded-md border border-line p-3">
                <legend className="text-xs text-muted">{item?.originalFilename ?? id}</legend>
                {withCopy ? (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <TextField label="Alt FR" name={`alt-${id}-fr`} defaultValue={item?.alts.fr ?? ""} maxLength={200} />
                    <TextField label="Alt EN" name={`alt-${id}-en`} defaultValue={item?.alts.en ?? ""} maxLength={200} />
                    <TextField label="Alt TR" name={`alt-${id}-tr`} defaultValue={item?.alts.tr ?? ""} maxLength={200} />
                  </div>
                ) : null}
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
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <ActionForm
      action={uploadImageAction}
      resetOnSuccess
      onSuccess={() => setFileName(null)}
      className="grid gap-3 rounded-md border border-dashed border-line bg-paper/40 p-4"
    >
      <p className="text-sm font-medium text-navy-950">Yeni görsel ekle</p>
      <FormStatus />
      <div className="flex flex-wrap items-center gap-3">
        <label className={`${buttonClass("primary")} cursor-pointer`}>
          Dosya seç
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            className="sr-only"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
          />
        </label>
        <p className="text-sm text-muted">{fileName ?? "JPEG, PNG, WebP veya GIF — en fazla 6 MB"}</p>
      </div>
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
        En az bir dilde alternatif metin önerilir. Dosya S3 yoksa PostgreSQL medya deposuna yazılır; yalnızca kayıt
        adresi olması dosyanın okunabildiği anlamına gelmez.
      </p>
      <div>
        <SubmitButton pendingLabel="Yükleniyor…">Görseli yükle</SubmitButton>
      </div>
    </ActionForm>
  );
}
