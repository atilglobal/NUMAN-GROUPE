"use client";

import { signInAction } from "@/admin/actions/auth";
import { ActionForm, FormStatus, SubmitButton, TextField } from "./forms";

export function LoginForm() {
  return (
    <ActionForm action={signInAction} className="grid gap-4">
      <FormStatus />
      <TextField label="E-posta" name="email" type="email" autoComplete="username" required maxLength={254} />
      <TextField
        label="Parola"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={128}
      />
      <SubmitButton pendingLabel="Giriş yapılıyor…">Giriş yap</SubmitButton>
    </ActionForm>
  );
}
