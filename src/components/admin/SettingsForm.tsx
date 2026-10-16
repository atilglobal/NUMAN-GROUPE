"use client";

import { useState } from "react";
import type { ActionState } from "@/auth/session";
import type { MediaPickerItem } from "@/media/store";
import { ActionForm, FormStatus, SubmitButton, TextAreaField, TextField } from "./forms";
import { MediaPicker, MediaUploadForm } from "./MediaPicker";

type ServerAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

export function SettingsForm({
  action,
  defaults,
  media,
}: {
  action: ServerAction;
  defaults: {
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    postalAddress: string;
    whatsapp: string;
    logoAssetId: string | null;
    faviconAssetId: string | null;
    socialLinks: { label: string; url: string }[];
  };
  media: MediaPickerItem[];
}) {
  const [social, setSocial] = useState(
    defaults.socialLinks.length > 0 ? defaults.socialLinks : [{ label: "", url: "" }],
  );

  return (
    <div className="grid gap-6">
      <MediaUploadForm />
      <ActionForm action={action} className="grid gap-6">
        <FormStatus />
        <p className="text-sm text-muted">
          Boş bırakılan telefon, e-posta, adres, WhatsApp veya sosyal bağlantı sitede hiç gösterilmez.
        </p>
        <TextField label="Firma adı" name="companyName" defaultValue={defaults.companyName} maxLength={160} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="İletişim e-postası" name="contactEmail" type="email" defaultValue={defaults.contactEmail} maxLength={254} />
          <TextField label="Telefon" name="contactPhone" type="tel" defaultValue={defaults.contactPhone} maxLength={40} />
        </div>
        <TextField
          label="WhatsApp"
          name="whatsapp"
          defaultValue={defaults.whatsapp}
          hint="Uluslararası numara, örn. 905xxxxxxxxx. Boşsa bağlantı yok."
        />
        <TextAreaField label="Posta adresi" name="postalAddress" defaultValue={defaults.postalAddress} rows={3} maxLength={500} />
        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium text-navy-950">Sosyal medya</legend>
          {social.map((row, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-2">
              <TextField label="Etiket" name="socialLabel" defaultValue={row.label} maxLength={80} />
              <TextField label="https adresi" name="socialUrl" defaultValue={row.url} maxLength={500} />
            </div>
          ))}
          <button
            type="button"
            className="w-fit text-sm text-navy-950 underline underline-offset-4"
            onClick={() => setSocial((current) => [...current, { label: "", url: "" }])}
          >
            Bağlantı ekle
          </button>
        </fieldset>
        <div>
          <p className="mb-2 text-sm font-medium text-navy-950">Logo</p>
          <MediaPicker
            items={media}
            coverId={defaults.logoAssetId}
            galleryIds={[]}
            allowGallery={false}
            coverName="logoAssetId"
            coverLabel="Logo yap"
            coverSelectedLabel="Logo seçili"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-navy-950">Favicon</p>
          <MediaPicker
            items={media}
            coverId={defaults.faviconAssetId}
            galleryIds={[]}
            allowGallery={false}
            coverName="faviconAssetId"
            coverLabel="Favicon yap"
            coverSelectedLabel="Favicon seçili"
          />
        </div>
        <div>
          <SubmitButton>Kaydet</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}
