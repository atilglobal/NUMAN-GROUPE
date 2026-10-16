"use client";

import type { ActionState } from "@/auth/session";
import { ActionForm, FormStatus, SubmitButton, TextAreaField, TextField } from "./forms";

type ServerAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

const BODY_HINT =
  "Biçimlendirme: ## Başlık, - madde, **kalın**, [bağlantı](https://…). Sertifika veya ülke iddiası uydurmayın. HTML yok.";

export function PageTranslationForm({
  action,
  defaults,
  exists,
  hint,
}: {
  action: ServerAction;
  defaults: { title: string; summary: string; body: string; seoTitle: string; seoDescription: string };
  exists: boolean;
  hint?: string;
}) {
  return (
    <ActionForm action={action} className="grid gap-4">
      {!exists ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bu dilde henüz içerik yok. Kaydedince taslak olur; yayımlanmadan sitede görünmez.
        </p>
      ) : null}
      <FormStatus />
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      <TextField label="Başlık" name="title" defaultValue={defaults.title} required maxLength={200} />
      <TextAreaField label="Kısa açıklama" name="summary" defaultValue={defaults.summary} rows={3} maxLength={500} />
      <TextAreaField label="Ayrıntılı içerik" name="body" defaultValue={defaults.body} rows={12} maxLength={20000} hint={BODY_HINT} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="SEO başlığı" name="seoTitle" defaultValue={defaults.seoTitle} maxLength={70} />
        <TextAreaField label="SEO açıklaması" name="seoDescription" defaultValue={defaults.seoDescription} rows={2} maxLength={200} />
      </div>
      <div>
        <SubmitButton>Kaydet</SubmitButton>
      </div>
    </ActionForm>
  );
}
