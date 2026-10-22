"use client";

import { useState } from "react";
import type { ActionState } from "@/auth/session";
import type { Locale } from "@/i18n/config";
import type { MediaPickerItem } from "@/media/store";
import { ActionForm, FormStatus, SelectField, SubmitButton, TextAreaField, TextField } from "./forms";
import { resolutionWarning } from "@/media/profiles";
import { MediaPicker, MediaUploadForm } from "./MediaPicker";

type ServerAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

export type VisitTranslationDefaults = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  hostInstitution: string;
  location: string;
  seoTitle: string;
  seoDescription: string;
};

export type VisitParticipantDefaults = {
  fullName: string;
  roles: Partial<Record<Locale, string | null>>;
};

export type VisitRootDefaults = {
  visitedOn: string | null;
  countryCode: string | null;
  isFeatured: boolean;
  coverAssetId: string | null;
  gallery: string[];
  participants: VisitParticipantDefaults[];
};

const SLUG_HINT = "Sayfa adresinin son bölümü. Yalnızca küçük harf (a-z), rakam ve tire.";
const BODY_HINT =
  "Biçimlendirme: ## Başlık, ### Alt başlık, - madde, 1. numaralı madde, **kalın**, *italik*, [bağlantı metni](https://…). HTML kullanılamaz.";
const VISIT_RULE =
  "Ziyareti ortaklık, devlet desteği, ihale kazanımı veya resmî onay olarak yazmayın. Kayıt bir ziyarettir.";

function TranslationFields({ defaults }: { defaults: VisitTranslationDefaults }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Başlık" name="title" defaultValue={defaults.title} required maxLength={200} />
        <TextField label="Bağlantı adı (slug)" name="slug" defaultValue={defaults.slug} hint={SLUG_HINT} required maxLength={160} />
      </div>
      <TextField
        label="Kurum"
        name="hostInstitution"
        defaultValue={defaults.hostInstitution}
        maxLength={200}
        hint="Ziyaret edilen kurumun adı. Uydurma unvan veya ortaklık ifadesi yazmayın."
      />
      <TextField label="Şehir" name="location" defaultValue={defaults.location} maxLength={120} />
      <TextAreaField
        label="Kısa açıklama"
        name="summary"
        defaultValue={defaults.summary}
        rows={3}
        maxLength={500}
        hint="Listelerde görünür. Ziyaretin amacı kısaca, iddia katmadan."
      />
      <TextAreaField label="Ayrıntılı içerik" name="body" defaultValue={defaults.body} rows={10} maxLength={20000} hint={BODY_HINT} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="SEO başlığı" name="seoTitle" defaultValue={defaults.seoTitle} maxLength={70} />
        <TextAreaField label="SEO açıklaması" name="seoDescription" defaultValue={defaults.seoDescription} rows={2} maxLength={200} />
      </div>
    </>
  );
}

function ParticipantFields({ initial }: { initial: VisitParticipantDefaults[] }) {
  const [rows, setRows] = useState(initial.length > 0 ? initial : [{ fullName: "", roles: {} }]);
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-medium text-navy-950">Katılımcılar</legend>
      <p className="text-xs text-muted">Ad dil bağımsızdır. Unvan yalnızca ilgili dilde verilmişse sitede görünür.</p>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 rounded-md border border-line p-3">
          <TextField label="Ad soyad" name="participantName" defaultValue={row.fullName} maxLength={160} />
          <div className="grid gap-2 sm:grid-cols-3">
            <TextField label="Unvan FR" name="participantRoleFr" defaultValue={row.roles.fr ?? ""} maxLength={160} />
            <TextField label="Unvan EN" name="participantRoleEn" defaultValue={row.roles.en ?? ""} maxLength={160} />
            <TextField label="Unvan TR" name="participantRoleTr" defaultValue={row.roles.tr ?? ""} maxLength={160} />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="w-fit text-sm text-navy-950 underline underline-offset-4"
        onClick={() => setRows((current) => [...current, { fullName: "", roles: {} }])}
      >
        Katılımcı ekle
      </button>
    </fieldset>
  );
}

function VisitRootFields({
  defaults,
  countryOptions,
  media,
}: {
  defaults: VisitRootDefaults;
  countryOptions: { value: string; label: string }[];
  media: MediaPickerItem[];
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Tarih"
          name="visitedOn"
          type="date"
          defaultValue={defaults.visitedOn ?? ""}
          hint="Belgede yoksa boş bırakın. Uydurma tarih yazmayın; sitede tarih alanı görünmez."
        />
        <SelectField
          label="Ülke"
          name="countryCode"
          defaultValue={defaults.countryCode ?? ""}
          options={[{ value: "", label: "Belirtilmedi" }, ...countryOptions]}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={defaults.isFeatured} />
        Ana sayfada göster
      </label>
      <ParticipantFields initial={defaults.participants} />
      <MediaPicker items={media} coverId={defaults.coverAssetId} galleryIds={defaults.gallery} withCaptions />
      {defaults.coverAssetId
        ? (() => {
            const cover = media.find((item) => item.id === defaults.coverAssetId);
            const warning = cover ? resolutionWarning(cover.width, cover.height, "visitPhoto") : null;
            return warning ? <p className="text-sm text-amber-800">{warning}</p> : null;
          })()
        : null}
    </div>
  );
}

const emptyTranslation: VisitTranslationDefaults = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  hostInstitution: "",
  location: "",
  seoTitle: "",
  seoDescription: "",
};

export function NewVisitForm({
  action,
  countryOptions,
  media,
}: {
  action: ServerAction;
  countryOptions: { value: string; label: string }[];
  media: MediaPickerItem[];
}) {
  return (
    <div className="grid gap-6">
      <MediaUploadForm />
      <ActionForm action={action} className="grid gap-6">
        <FormStatus />
        <p className="rounded-md border border-line bg-paper-2 px-4 py-3 text-sm text-ink">{VISIT_RULE}</p>
        <p className="text-sm text-muted">Fransızca taslak olarak oluşturulur. Diğer diller sonraki ekranda eklenir.</p>
        <TranslationFields defaults={emptyTranslation} />
        <VisitRootFields
          defaults={{
            visitedOn: null,
            countryCode: null,
            isFeatured: false,
            coverAssetId: null,
            gallery: [],
            participants: [],
          }}
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

export function VisitTranslationForm({
  action,
  defaults,
  exists,
}: {
  action: ServerAction;
  defaults: VisitTranslationDefaults;
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
      <p className="text-xs text-muted">{VISIT_RULE}</p>
      <TranslationFields defaults={defaults} />
      <div>
        <SubmitButton>Kaydet</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function VisitRootForm({
  action,
  defaults,
  countryOptions,
  media,
}: {
  action: ServerAction;
  defaults: VisitRootDefaults;
  countryOptions: { value: string; label: string }[];
  media: MediaPickerItem[];
}) {
  return (
    <div className="grid gap-6">
      <MediaUploadForm />
      <ActionForm action={action} className="grid gap-4">
        <FormStatus />
        <VisitRootFields defaults={defaults} countryOptions={countryOptions} media={media} />
        <div>
          <SubmitButton>Genel bilgileri kaydet</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}
