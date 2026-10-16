"use client";

import type { ActionState } from "@/auth/session";
import type { MediaPickerItem } from "@/media/store";
import { ActionForm, FormStatus, SubmitButton, TextAreaField, TextField } from "./forms";
import { MediaPicker, MediaUploadForm } from "./MediaPicker";

type ServerAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

export type TranslationDefaults = {
  name: string;
  slug: string;
  summary: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
};

const SLUG_HINT = "Sayfa adresinin son bölümü, örn. stades. Yalnızca küçük harf (a-z), rakam ve tire.";
const BODY_HINT =
  "Biçimlendirme: ## Başlık, ### Alt başlık, - madde, 1. numaralı madde, **kalın**, *italik*, [bağlantı metni](https://…). HTML kullanılamaz.";

function TranslationFields({ defaults }: { defaults: TranslationDefaults }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Ad" name="name" defaultValue={defaults.name} required maxLength={160} />
        <TextField label="Bağlantı adı (slug)" name="slug" defaultValue={defaults.slug} hint={SLUG_HINT} required maxLength={160} />
      </div>
      <TextAreaField label="Kısa açıklama" name="summary" defaultValue={defaults.summary} rows={3} maxLength={500} hint="Listelerde ve arama sonuçlarında görünür." />
      <TextAreaField label="Ayrıntılı içerik" name="body" defaultValue={defaults.body} rows={10} maxLength={20000} hint={BODY_HINT} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="SEO başlığı" name="seoTitle" defaultValue={defaults.seoTitle} maxLength={70} hint="Boşsa sayfa başlığı kullanılır." />
        <TextAreaField label="SEO açıklaması" name="seoDescription" defaultValue={defaults.seoDescription} rows={2} maxLength={200} />
      </div>
    </>
  );
}

export function NewExpertiseForm({ action }: { action: ServerAction }) {
  return (
    <ActionForm action={action} className="grid max-w-3xl gap-4">
      <FormStatus />
      <p className="text-sm text-muted">
        Kayıt Fransızca (ana dil) taslak olarak oluşturulur. İngilizce ve Türkçe içerikleri sonraki ekranda ekleyebilirsiniz.
      </p>
      <TranslationFields defaults={{ name: "", slug: "", summary: "", body: "", seoTitle: "", seoDescription: "" }} />
      <div className="max-w-40">
        <TextField label="Sıra" name="sortOrder" type="number" min={0} defaultValue={0} hint="Küçük sayı önce gösterilir." />
      </div>
      <div>
        <SubmitButton pendingLabel="Oluşturuluyor…">Taslak olarak oluştur</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function TranslationForm({
  action,
  defaults,
  exists,
}: {
  action: ServerAction;
  defaults: TranslationDefaults;
  exists: boolean;
}) {
  return (
    <ActionForm action={action} className="grid gap-4">
      {!exists ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bu dilde henüz içerik yok. Kaydettiğinizde taslak olarak oluşturulur; yayımlayana kadar sitede görünmez.
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

export function PublishForm({ action, published }: { action: ServerAction; published: boolean }) {
  return (
    <ActionForm action={action} className="grid gap-2">
      <FormStatus />
      <div>
        <SubmitButton variant={published ? "secondary" : "primary"} pendingLabel="İşleniyor…">
          {published ? "Yayından kaldır" : "Yayımla"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

export function RootForm({
  action,
  sortOrder,
  coverAssetId,
  media,
}: {
  action: ServerAction;
  sortOrder: number;
  coverAssetId: string | null;
  media: MediaPickerItem[];
}) {
  return (
    <div className="grid gap-6">
      <MediaUploadForm />
      <ActionForm action={action} className="grid gap-4">
        <FormStatus />
        <div className="w-40">
          <TextField label="Sıra" name="sortOrder" type="number" min={0} defaultValue={sortOrder} />
        </div>
        <MediaPicker items={media} coverId={coverAssetId} galleryIds={[]} allowGallery={false} />
        <div>
          <SubmitButton variant="secondary">Genel ayarları kaydet</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}
