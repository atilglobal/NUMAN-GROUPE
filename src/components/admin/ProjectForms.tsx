"use client";

import { useState } from "react";
import type { ActionState } from "@/auth/session";
import type { TechnicalDetail } from "@/db/schema/projects";
import type { MediaPickerItem } from "@/media/store";
import { ActionForm, FormStatus, SelectField, SubmitButton, TextAreaField, TextField } from "./forms";
import { MediaPicker, MediaUploadForm } from "./MediaPicker";

type ServerAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

export type ProjectTranslationDefaults = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  city: string;
  seoTitle: string;
  seoDescription: string;
  technicalDetails: TechnicalDetail[];
};

const SLUG_HINT = "Sayfa adresinin son bölümü. Yalnızca küçük harf (a-z), rakam ve tire.";
const BODY_HINT =
  "Biçimlendirme: ## Başlık, ### Alt başlık, - madde, 1. numaralı madde, **kalın**, *italik*, [bağlantı metni](https://…). HTML kullanılamaz.";

function TechnicalFields({ initial }: { initial: TechnicalDetail[] }) {
  const [rows, setRows] = useState(initial.length > 0 ? initial : [{ label: "", value: "" }]);
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium text-navy-950">Teknik bilgiler</legend>
      <p className="text-xs text-muted">Etiketi veya değeri boş olan satır sitede gösterilmez. Tarihten oran üretilmez.</p>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-2">
          <input
            name="techLabel"
            defaultValue={row.label}
            placeholder="Etiket"
            maxLength={80}
            className="min-h-10 rounded-md border border-line bg-white px-3 text-sm"
          />
          <input
            name="techValue"
            defaultValue={row.value}
            placeholder="Değer"
            maxLength={200}
            className="min-h-10 rounded-md border border-line bg-white px-3 text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        className="w-fit text-sm text-navy-950 underline underline-offset-4"
        onClick={() => setRows((current) => [...current, { label: "", value: "" }])}
      >
        Satır ekle
      </button>
    </fieldset>
  );
}

function TranslationFields({ defaults }: { defaults: ProjectTranslationDefaults }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Başlık" name="title" defaultValue={defaults.title} required maxLength={200} />
        <TextField label="Bağlantı adı (slug)" name="slug" defaultValue={defaults.slug} hint={SLUG_HINT} required maxLength={160} />
      </div>
      <TextField label="Şehir" name="city" defaultValue={defaults.city} maxLength={120} hint="Ülke kök kayıtta seçilir; uydurma konum yazmayın." />
      <TextAreaField label="Kısa açıklama" name="summary" defaultValue={defaults.summary} rows={3} maxLength={500} />
      <TextAreaField label="Ayrıntılı içerik" name="body" defaultValue={defaults.body} rows={10} maxLength={20000} hint={BODY_HINT} />
      <TechnicalFields initial={defaults.technicalDetails} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="SEO başlığı" name="seoTitle" defaultValue={defaults.seoTitle} maxLength={70} />
        <TextAreaField label="SEO açıklaması" name="seoDescription" defaultValue={defaults.seoDescription} rows={2} maxLength={200} />
      </div>
    </>
  );
}

export type RootDefaults = {
  status: "in_progress" | "completed";
  expertiseId: string | null;
  countryCode: string | null;
  startedOn: string | null;
  completedOn: string | null;
  videoUrl: string | null;
  progressPercent: number | null;
  isFeatured: boolean;
  sortOrder: number;
  coverAssetId: string | null;
  gallery: string[];
};

export function ProjectRootFields({
  defaults,
  expertiseOptions,
  countryOptions,
  media,
}: {
  defaults: RootDefaults;
  expertiseOptions: { value: string; label: string }[];
  countryOptions: { value: string; label: string }[];
  media: MediaPickerItem[];
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="İnşaat durumu"
          name="status"
          defaultValue={defaults.status}
          options={[
            { value: "in_progress", label: "Devam ediyor" },
            { value: "completed", label: "Tamamlandı" },
          ]}
        />
        <SelectField
          label="Uzmanlık alanı"
          name="expertiseId"
          defaultValue={defaults.expertiseId ?? ""}
          options={[{ value: "", label: "Bağlantı yok" }, ...expertiseOptions]}
          hint="Uzmanlık silinirse proje kalır; bağlantı boşalır."
        />
        <SelectField
          label="Ülke"
          name="countryCode"
          defaultValue={defaults.countryCode ?? ""}
          options={[{ value: "", label: "Belirtilmedi" }, ...countryOptions]}
        />
        <TextField label="Sıra" name="sortOrder" type="number" min={0} defaultValue={defaults.sortOrder} />
        <TextField label="Başlangıç" name="startedOn" type="date" defaultValue={defaults.startedOn ?? ""} />
        <TextField label="Bitiş" name="completedOn" type="date" defaultValue={defaults.completedOn ?? ""} />
        <TextField
          label="İlerleme (%)"
          name="progressPercent"
          type="number"
          min={0}
          max={100}
          defaultValue={defaults.progressPercent ?? ""}
          hint="Zorunlu değil. Yalnızca doğrulanmış bir oran girin; tarihten hesaplanmaz."
        />
        <TextField label="Video (https)" name="videoUrl" defaultValue={defaults.videoUrl ?? ""} maxLength={500} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={defaults.isFeatured} />
        Öne çıkar (listelerde önce görünür)
      </label>
      <MediaPicker items={media} coverId={defaults.coverAssetId} galleryIds={defaults.gallery} />
    </div>
  );
}

const emptyTranslation: ProjectTranslationDefaults = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  city: "",
  seoTitle: "",
  seoDescription: "",
  technicalDetails: [],
};

export function NewProjectForm({
  action,
  expertiseOptions,
  countryOptions,
  media,
}: {
  action: ServerAction;
  expertiseOptions: { value: string; label: string }[];
  countryOptions: { value: string; label: string }[];
  media: MediaPickerItem[];
}) {
  return (
    <div className="grid gap-6">
      <MediaUploadForm />
      <ActionForm action={action} className="grid gap-6">
        <FormStatus />
        <p className="text-sm text-muted">
          Fransızca taslak olarak oluşturulur. Diğer diller sonraki ekranda eklenir.
        </p>
        <TranslationFields defaults={emptyTranslation} />
        <ProjectRootFields
          defaults={{
            status: "in_progress",
            expertiseId: null,
            countryCode: null,
            startedOn: null,
            completedOn: null,
            videoUrl: null,
            progressPercent: null,
            isFeatured: false,
            sortOrder: 0,
            coverAssetId: null,
            gallery: [],
          }}
          expertiseOptions={expertiseOptions}
          countryOptions={countryOptions}
          media={media}
        />
        <div>
          <SubmitButton pendingLabel="Oluşturuluyor…">Taslak olarak oluştur</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}

export function ProjectTranslationForm({
  action,
  defaults,
  exists,
}: {
  action: ServerAction;
  defaults: ProjectTranslationDefaults;
  exists: boolean;
}) {
  return (
    <ActionForm action={action} className="grid gap-4">
      {!exists ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bu dilde henüz içerik yok. Kaydedince taslak olur.
        </p>
      ) : null}
      <FormStatus />
      <TranslationFields defaults={defaults} />
      <div>
        <SubmitButton>Kaydet</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function ProjectRootForm({
  action,
  defaults,
  expertiseOptions,
  countryOptions,
  media,
}: {
  action: ServerAction;
  defaults: RootDefaults;
  expertiseOptions: { value: string; label: string }[];
  countryOptions: { value: string; label: string }[];
  media: MediaPickerItem[];
}) {
  return (
    <div className="grid gap-6">
      <MediaUploadForm />
      <ActionForm action={action} className="grid gap-4">
        <FormStatus />
        <ProjectRootFields
          defaults={defaults}
          expertiseOptions={expertiseOptions}
          countryOptions={countryOptions}
          media={media}
        />
        <div>
          <SubmitButton>Genel bilgileri kaydet</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}
