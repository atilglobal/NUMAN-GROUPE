"use client";

import { ActionForm, FormStatus, SubmitButton, TextField } from "@/components/admin/forms";
import { submitSetupAction } from "@/setup/actions";

export function SetupForm() {
  return (
    <ActionForm action={submitSetupAction} className="grid gap-4">
      <FormStatus />
      <TextField
        label="Kurulum anahtarı"
        name="setupKey"
        type="password"
        autoComplete="off"
        required
        maxLength={256}
      />
      <TextField
        label="Yönetici kullanıcı adı"
        name="username"
        type="text"
        autoComplete="username"
        required
        maxLength={32}
      />
      <TextField label="Yönetici e-posta adresi" name="email" type="email" autoComplete="off" required maxLength={254} />
      <TextField
        label="Parola"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
      />
      <TextField
        label="Parola (tekrar)"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
      />
      <SubmitButton pendingLabel="Kuruluyor…">Kurulumu tamamla</SubmitButton>
    </ActionForm>
  );
}
