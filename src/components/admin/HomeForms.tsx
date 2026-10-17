"use client";

import { useState } from "react";
import type { ActionState } from "@/auth/session";
import { HOME_SECTION_KEYS, type HomeSectionLayout } from "@/content/home-layout";
import type { MediaPickerItem } from "@/media/store";
import { ActionForm, FormStatus, SubmitButton, TextAreaField, TextField } from "./forms";
import { MediaPicker, MediaUploadForm } from "./MediaPicker";

type ServerAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

const SECTION_LABELS: Record<(typeof HOME_SECTION_KEYS)[number], string> = {
  hero: "Hero",
  intro: "Kısa tanıtım",
  process: "Süreç",
  expertises: "Uzmanlıklar",
  projects: "Projeler",
  visits: "Resmî ziyaretler",
  team: "Kadro",
  cta: "Çağrı (CTA)",
};

export function HomeVisualsForm({
  action,
  media,
  defaults,
}: {
  action: ServerAction;
  media: MediaPickerItem[];
  defaults: {
    heroImageAssetId: string | null;
    callToActionImageAssetId: string | null;
    heroVideoUrl: string;
    homeSections: HomeSectionLayout[];
  };
}) {
  const [sections, setSections] = useState(defaults.homeSections);

  function move(index: number, direction: -1 | 1) {
    setSections((current) => {
      const next = index + direction;
      if (next < 0 || next >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  return (
    <div className="grid gap-6">
      <MediaUploadForm />
      <ActionForm action={action} className="grid gap-6">
        <FormStatus />
        <p className="text-sm text-muted">
          Tam bir sürükle-bırak oluşturucu yoktur. Blok sırası ve görünürlüğü aşağıdan yönetilir. Ana sayfadaki projeler
          ve ziyaretler, ilgili kayıtlardaki “Ana sayfada göster” işaretinden gelir.
        </p>
        <TextField
          label="Hero videosu (https)"
          name="heroVideoUrl"
          defaultValue={defaults.heroVideoUrl}
          hint="Doluysa görsel yerine video oynar. YouTube gömme değil, doğrudan https video adresi."
        />
        <div>
          <p className="mb-2 text-sm font-medium text-navy-950">Hero görseli</p>
          <MediaPicker
            items={media}
            coverId={defaults.heroImageAssetId}
            galleryIds={[]}
            allowGallery={false}
            coverName="heroImageAssetId"
            coverLabel="Hero görseli yap"
            coverSelectedLabel="Hero görseli seçili"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-navy-950">CTA görseli</p>
          <MediaPicker
            items={media}
            coverId={defaults.callToActionImageAssetId}
            galleryIds={[]}
            allowGallery={false}
            coverName="ctaImageAssetId"
            coverLabel="CTA görseli yap"
            coverSelectedLabel="CTA görseli seçili"
          />
        </div>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium text-navy-950">Bölüm sırası ve görünürlük</legend>
          {sections.map((section, index) => (
            <div key={section.key} className="flex flex-wrap items-center gap-2 rounded-md border border-line p-2">
              <input type="hidden" name="homeSection" value={section.key} />
              <label className="flex flex-1 items-center gap-2 text-sm">
                <input type="checkbox" name="homeVisible" value={section.key} defaultChecked={section.visible} />
                {SECTION_LABELS[section.key]}
              </label>
              <button type="button" className="min-h-8 rounded border border-line px-2 text-sm" onClick={() => move(index, -1)}>
                Yukarı
              </button>
              <button type="button" className="min-h-8 rounded border border-line px-2 text-sm" onClick={() => move(index, 1)}>
                Aşağı
              </button>
            </div>
          ))}
        </fieldset>
        <div>
          <SubmitButton>Düzeni kaydet</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}

export function HomeCopyForm({
  action,
  defaults,
  exists,
}: {
  action: ServerAction;
  defaults: {
    heroTitle: string;
    heroDescription: string;
    introTitle: string;
    introBody: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaLabel: string;
    ctaHref: string;
    footerTagline: string;
    seoTitle: string;
    seoDescription: string;
  };
  exists: boolean;
}) {
  return (
    <ActionForm action={action} className="grid gap-4">
      {!exists ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bu dilde henüz yayımlanabilir metin yok. Kaydedince taslak olur; yayımlanmazsa sitede sözlük metni kalır.
        </p>
      ) : null}
      <FormStatus />
      <TextField label="Hero başlığı" name="heroTitle" defaultValue={defaults.heroTitle} maxLength={200} />
      <TextAreaField label="Hero açıklaması" name="heroDescription" defaultValue={defaults.heroDescription} rows={3} maxLength={500} />
      <TextField label="Tanıtım başlığı" name="introTitle" defaultValue={defaults.introTitle} maxLength={200} />
      <TextAreaField label="Kısa şirket tanıtımı" name="introBody" defaultValue={defaults.introBody} rows={5} maxLength={4000} />
      <TextField label="CTA başlığı" name="ctaTitle" defaultValue={defaults.ctaTitle} maxLength={200} />
      <TextAreaField label="CTA açıklaması" name="ctaDescription" defaultValue={defaults.ctaDescription} rows={2} maxLength={500} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="CTA düğme metni" name="ctaLabel" defaultValue={defaults.ctaLabel} maxLength={80} />
        <TextField
          label="CTA hedefi"
          name="ctaHref"
          defaultValue={defaults.ctaHref}
          hint="Örn. /fr/contact veya https://…"
        />
      </div>
      <TextField label="Footer satırı" name="footerTagline" defaultValue={defaults.footerTagline} maxLength={200} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Varsayılan SEO başlığı" name="seoTitle" defaultValue={defaults.seoTitle} maxLength={70} />
        <TextAreaField label="Varsayılan SEO açıklaması" name="seoDescription" defaultValue={defaults.seoDescription} rows={2} maxLength={200} />
      </div>
      <div>
        <SubmitButton>Metni kaydet</SubmitButton>
      </div>
    </ActionForm>
  );
}
