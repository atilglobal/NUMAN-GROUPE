"use client";

import type { ActionState } from "@/auth/session";
import { ActionForm, FormStatus, SubmitButton, TextAreaField, TextField } from "./forms";

type ServerAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

export function ChangePasswordForm({ action }: { action: ServerAction }) {
  return (
    <ActionForm action={action} resetOnSuccess className="grid max-w-md gap-4">
      <FormStatus />
      <TextField label="Mevcut parola" name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} />
      <TextField
        label="Yeni parola"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint="En az 8 karakter. Uzun bir parola cümlesi kullanabilirsiniz."
      />
      <TextField label="Yeni parola (tekrar)" name="confirmPassword" type="password" autoComplete="new-password" required maxLength={128} />
      <div>
        <SubmitButton>Parolayı değiştir</SubmitButton>
      </div>
    </ActionForm>
  );
}

export type SettingsDefaults = {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  postalAddress: string;
};

export function SettingsForm({ action, defaults }: { action: ServerAction; defaults: SettingsDefaults }) {
  return (
    <ActionForm action={action} className="grid max-w-2xl gap-4">
      <FormStatus />
      <TextField label="Firma adı" name="companyName" defaultValue={defaults.companyName} maxLength={160} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="İletişim e-postası" name="contactEmail" type="email" defaultValue={defaults.contactEmail} maxLength={254} />
        <TextField label="Telefon" name="contactPhone" type="tel" defaultValue={defaults.contactPhone} maxLength={40} />
      </div>
      <TextAreaField label="Posta adresi" name="postalAddress" defaultValue={defaults.postalAddress} rows={3} maxLength={500} />
      <div>
        <SubmitButton>Kaydet</SubmitButton>
      </div>
    </ActionForm>
  );
}
