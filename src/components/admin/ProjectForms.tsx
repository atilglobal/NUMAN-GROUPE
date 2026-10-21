"use client";

import type { ActionState } from "@/auth/session";
import type { ProjectStatus } from "@/db/schema/projects";
import type { MediaPickerItem } from "@/media/store";
import { ActionForm, CheckboxField, FormStatus, SelectField, SubmitButton, TextAreaField, TextField } from "./forms";
import { MediaPicker, MediaUploadForm } from "./MediaPicker";

type ServerAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

export type ProjectTranslationDefaults = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
};

const SLUG_HINT =
  "Boş bırakılırsa başlıktan, kurallara uygun ve benzersiz bir bağlantı adı üretilir. Yalnızca küçük harf (a-z), rakam ve tire.";
const BODY_HINT =
  "Biçimlendirme: ## Başlık, ### Alt başlık, - madde, 1. numaralı madde, **kalın**, *italik*, [bağlantı metni](https://…). HTML kullanılamaz.";

const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "planned", label: "Planlanan Projeler" },
  { value: "in_progress", label: "Devam Eden Projeler" },
  { value: "completed", label: "Tamamlanan Projeler" },
];

function TranslationFields({ defaults }: { defaults: ProjectTranslationDefaults }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Başlık" name="title" defaultValue={defaults.title} required maxLength={200} />
        <TextField label="Bağlantı adı (slug)" name="slug" defaultValue={defaults.slug} hint={SLUG_HINT} maxLength={160} />
      </div>
      <TextAreaField label="Kısa açıklama" name="summary" defaultValue={defaults.summary} rows={3} maxLength={500} />
      <TextAreaField label="Ayrıntılı içerik" name="body" defaultValue={defaults.body} rows={10} maxLength={20000} hint={BODY_HINT} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="SEO başlığı" name="seoTitle" defaultValue={defaults.seoTitle} maxLength={70} />
        <TextAreaField label="SEO açıklaması" name="seoDescription" defaultValue={defaults.seoDescription} rows={2} maxLength={200} />
      </div>
    </>
  );
}

export type RootDefaults = {
  status: ProjectStatus;
  isFeatured: boolean;
  sortOrder: number;
  coverAssetId: string | null;
  gallery: string[];
};

export function ProjectRootFields({
  defaults,
  media,
}: {
  defaults: RootDefaults;
  media: MediaPickerItem[];
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Proje durumu"
          name="status"
          defaultValue={defaults.status}
          options={PROJECT_STATUS_OPTIONS}
          hint="Yayın durumundan ayrıdır. Planlanan bir proje de yayımlanabilir."
        />
        <TextField label="Sıra" name="sortOrder" type="number" min={0} defaultValue={defaults.sortOrder} />
      </div>
      <CheckboxField name="isFeatured" defaultChecked={defaults.isFeatured}>
        Ana sayfada öne çıkar
      </CheckboxField>
      <MediaPicker
        key={`${defaults.coverAssetId ?? ""}:${defaults.gallery.join(",")}`}
        items={media}
        coverId={defaults.coverAssetId}
        galleryIds={defaults.gallery}
        withCopy
      />
    </div>
  );
}

const emptyTranslation: ProjectTranslationDefaults = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  seoTitle: "",
  seoDescription: "",
};

export function NewProjectForm({ action, media }: { action: ServerAction; media: MediaPickerItem[] }) {
  return (
    <div className="grid gap-6">
      <MediaUploadForm />
      <ActionForm action={action} className="grid gap-6">
        <FormStatus />
        <p className="text-sm text-muted">
          Bir dilde başlık ve proje durumu yeterlidir. Kapak, galeri, SEO ve diğer diller taslağı engellemez.
          Kayıttan sonra düzenleme ekranı açılır.
        </p>
        <TranslationFields defaults={emptyTranslation} />
        <ProjectRootFields
          defaults={{
            status: "planned",
            isFeatured: false,
            sortOrder: 0,
            coverAssetId: null,
            gallery: [],
          }}
          media={media}
        />
        <div>
          <SubmitButton pendingLabel="Kaydediliyor…">Taslak kaydet</SubmitButton>
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
          Bu dilde henüz içerik yok. “Taslak kaydet” yalnızca bu dili yazar; diğer diller değişmez.
        </p>
      ) : null}
      <FormStatus />
      <TranslationFields defaults={defaults} />
      <div>
        <SubmitButton pendingLabel="Kaydediliyor…">Taslak kaydet</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function ProjectRootForm({
  action,
  defaults,
  media,
}: {
  action: ServerAction;
  defaults: RootDefaults;
  media: MediaPickerItem[];
}) {
  return (
    <div className="grid gap-6">
      <MediaUploadForm />
      <ActionForm action={action} className="grid gap-4">
        <FormStatus />
        <ProjectRootFields defaults={defaults} media={media} />
        <div>
          <SubmitButton pendingLabel="Kaydediliyor…">Genel bilgileri kaydet</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}
