"use client";

import { useActionState, useCallback, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/auth/session";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { submitInquiryAction } from "@/inquiries/actions";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "./Field";

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function InquiryForm({
  locale,
  dict,
  privacyHref,
  expertises,
  countries,
}: {
  locale: Locale;
  dict: Dictionary;
  privacyHref: string;
  expertises: { id: string; name: string }[];
  countries: { value: string; label: string }[];
}) {
  const tokenRef = useRef<string | null>(null);
  const boundAction = useCallback(
    (previous: ActionState, formData: FormData) => {
      if (!tokenRef.current) tokenRef.current = crypto.randomUUID();
      formData.set("idempotencyKey", tokenRef.current);
      return submitInquiryAction(locale, previous, formData);
    },
    [locale],
  );
  const [state, formAction] = useActionState(boundAction, { ok: false } satisfies ActionState);
  const t = dict.inquiry;
  const req = dict.forms.required;

  if (state.ok && state.message) {
    return (
      <p role="status" className="border-l-2 border-gold-400 pl-5 text-base leading-relaxed text-ink">
        {state.message}
      </p>
    );
  }

  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <p className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Company URL
          <input type="text" name="companyUrl" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      {state.message && !state.ok ? (
        <p role="alert" className="text-sm font-medium text-red-800">
          {state.message}
        </p>
      ) : null}
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium text-navy-950">
          {t.type}
          <span className="ml-1 text-muted">*</span>
        </legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="type" value="contact" defaultChecked />
          {t.typeContact}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="type" value="project_request" />
          {t.typeProject}
        </label>
        {err.type ? <p className="text-sm font-medium text-red-800">{err.type}</p> : null}
      </fieldset>
      <TextField
        id="fullName"
        name="fullName"
        label={t.fullName}
        requiredLabel={req}
        required
        maxLength={160}
        autoComplete="name"
        error={err.fullName}
      />
      <TextField
        id="organization"
        name="organization"
        label={t.organization}
        requiredLabel={req}
        required
        maxLength={160}
        autoComplete="organization"
        error={err.organization}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="email"
          name="email"
          type="email"
          label={t.email}
          requiredLabel={req}
          required
          maxLength={254}
          autoComplete="email"
          error={err.email}
        />
        <TextField
          id="phone"
          name="phone"
          type="tel"
          label={t.phone}
          requiredLabel={req}
          hint={dict.forms.optional}
          maxLength={40}
          autoComplete="tel"
          error={err.phone}
        />
      </div>
      <SelectField
        id="countryCode"
        name="countryCode"
        label={t.country}
        requiredLabel={req}
        required
        error={err.countryCode}
        options={[{ value: "", label: t.countryEmpty }, ...countries]}
      />
      <SelectField
        id="relatedExpertiseId"
        name="relatedExpertiseId"
        label={t.projectType}
        requiredLabel={req}
        error={err.relatedExpertiseId}
        options={[{ value: "", label: t.projectTypeEmpty }, ...expertises.map((item) => ({ value: item.id, label: item.name }))]}
      />
      <TextAreaField
        id="message"
        name="message"
        label={t.message}
        requiredLabel={req}
        required
        maxLength={4000}
        error={err.message}
      />
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" name="privacyConsent" value="on" className="mt-1" required />
        <span>
          {t.privacy}{" "}
          <a href={privacyHref} className="underline underline-offset-4">
            {t.privacyLink}
          </a>
        </span>
      </label>
      {err.privacyConsent ? <p className="text-sm font-medium text-red-800">{err.privacyConsent}</p> : null}
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" name="preferenceConsent" value="on" className="mt-1" />
        <span>{t.preference}</span>
      </label>
      <div>
        <Submit label={t.submit} pendingLabel={t.pending} />
      </div>
    </form>
  );
}
