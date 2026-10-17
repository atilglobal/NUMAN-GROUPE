"use client";

import { roleOptions } from "@/admin/labels";
import type { ActionState } from "@/auth/session";
import { ActionForm, FormStatus, SelectField, SubmitButton, TextField } from "./forms";

type ServerAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

export function CreateUserForm({ action }: { action: ServerAction }) {
  return (
    <ActionForm action={action} resetOnSuccess className="grid gap-4">
      <FormStatus />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Ad soyad" name="name" required maxLength={120} autoComplete="off" />
        <TextField
          label="Kullanıcı adı veya e-posta"
          name="email"
          type="text"
          required
          maxLength={254}
          autoComplete="off"
        />
        <SelectField label="Rol" name="role" options={roleOptions} defaultValue="editor" />
        <TextField
          label="Başlangıç parolası"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          hint="En az 8 karakter. Kullanıcı ilk girişten sonra Hesabım sayfasından değiştirebilir."
        />
      </div>
      <div>
        <SubmitButton pendingLabel="Ekleniyor…">Kullanıcı ekle</SubmitButton>
      </div>
    </ActionForm>
  );
}
