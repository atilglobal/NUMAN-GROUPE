"use client";

import type { ActionState } from "@/auth/session";
import type { MediaPickerItem } from "@/media/store";
import { ActionForm, FormStatus, SubmitButton, TextAreaField, TextField } from "./forms";
import { MediaPicker, MediaUploadForm } from "./MediaPicker";

type ServerAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

const BODY_HINT =
  "Biyografi uydurma unvan veya kişi içermemelidir. Yalnızca doğrulanmış bilgileri yazın.";

export function NewTeamForm({ action, media }: { action: ServerAction; media: MediaPickerItem[] }) {
  return (
    <div className="grid gap-6">
      <MediaUploadForm />
      <ActionForm action={action} className="grid gap-6">
        <FormStatus />
        <p className="text-sm text-muted">
          Kayıt Fransızca taslak olarak oluşur. Unvan ve biyografi diğer dillerde sonraki ekranda eklenir. Uydurma kişi
          yazmayın.
        </p>
        <TextField label="Ad soyad" name="fullName" required maxLength={160} />
        <TextField label="Görev / unvan (FR)" name="roleTitle" required maxLength={160} />
        <TextAreaField label="Biyografi (FR)" name="bio" rows={6} maxLength={4000} hint={BODY_HINT} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Sıra" name="sortOrder" type="number" min={0} defaultValue={0} />
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" name="isVisible" defaultChecked />
            Sitede görünür
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Profil etiketi" name="linkLabel" maxLength={80} hint="Örn. LinkedIn. Boşsa bağlantı gösterilmez." />
          <TextField label="Profil bağlantısı" name="linkUrl" maxLength={500} hint="Yalnızca https." />
        </div>
        <MediaPicker
          items={media}
          coverId={null}
          galleryIds={[]}
          allowGallery={false}
          coverLabel="Fotoğraf yap"
          coverSelectedLabel="Fotoğraf seçili"
        />
        <div>
          <SubmitButton pendingLabel="Oluşturuluyor…">Taslak olarak oluştur</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}

export function TeamTranslationForm({
  action,
  defaults,
  exists,
}: {
  action: ServerAction;
  defaults: { roleTitle: string; bio: string };
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
      <TextField label="Görev / unvan" name="roleTitle" defaultValue={defaults.roleTitle} required maxLength={160} />
      <TextAreaField label="Biyografi" name="bio" defaultValue={defaults.bio} rows={8} maxLength={4000} hint={BODY_HINT} />
      <div>
        <SubmitButton>Kaydet</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function TeamRootForm({
  action,
  defaults,
  media,
}: {
  action: ServerAction;
  defaults: {
    fullName: string;
    sortOrder: number;
    isVisible: boolean;
    photoAssetId: string | null;
    linkLabel: string;
    linkUrl: string;
  };
  media: MediaPickerItem[];
}) {
  return (
    <div className="grid gap-6">
      <MediaUploadForm />
      <ActionForm action={action} className="grid gap-4">
        <FormStatus />
        <TextField label="Ad soyad" name="fullName" defaultValue={defaults.fullName} required maxLength={160} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Sıra" name="sortOrder" type="number" min={0} defaultValue={defaults.sortOrder} />
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" name="isVisible" defaultChecked={defaults.isVisible} />
            Sitede görünür
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Profil etiketi" name="linkLabel" defaultValue={defaults.linkLabel} maxLength={80} />
          <TextField label="Profil bağlantısı" name="linkUrl" defaultValue={defaults.linkUrl} maxLength={500} />
        </div>
        <MediaPicker
          items={media}
          coverId={defaults.photoAssetId}
          galleryIds={[]}
          allowGallery={false}
          coverLabel="Fotoğraf yap"
          coverSelectedLabel="Fotoğraf seçili"
        />
        <div>
          <SubmitButton>Genel bilgileri kaydet</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}
