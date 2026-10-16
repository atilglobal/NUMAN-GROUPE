"use client";

import { useMemo, useState } from "react";
import { restoreUiStringAction, saveUiStringAction } from "@/admin/actions/ui-strings";
import type { UiOverrideRow } from "@/admin/ui-strings";
import { locales, type Locale } from "@/i18n/config";
import { uiGroupLabels } from "@/i18n/catalog";
import { ActionForm, FormStatus, SubmitButton } from "./forms";

export function UiStringsEditor({ rows }: { rows: UiOverrideRow[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [dirty, setDirty] = useState(false);

  const groups = useMemo(() => [...new Set(rows.map((row) => row.group))], [rows]);
  const filtered = rows.filter((row) => {
    if (group !== "all" && row.group !== group) return false;
    const hay = `${row.key} ${Object.values(row.defaults).join(" ")} ${Object.values(row.values).join(" ")}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  return (
    <div className="grid gap-4">
      {dirty ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Kaydedilmemiş değişiklikler var. Ayrılmadan önce kaydedin.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Metin veya anahtar ara"
          className="min-h-10 min-w-[16rem] flex-1 rounded border border-line px-3 text-sm"
        />
        <select
          value={group}
          onChange={(event) => setGroup(event.target.value)}
          className="min-h-10 rounded border border-line px-3 text-sm"
        >
          <option value="all">Tüm bölümler</option>
          {groups.map((item) => (
            <option key={item} value={item}>
              {uiGroupLabels[item] ?? item}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-muted">{filtered.length} metin. Anahtarlar kilitlidir; yalnızca değerler değişir.</p>
      <ul className="grid gap-4">
        {filtered.map((row) => (
          <li key={row.key} className="rounded-lg border border-line bg-white p-4">
            <p className="font-mono text-xs text-muted">{row.key}</p>
            <p className="text-xs text-muted">{uiGroupLabels[row.group] ?? row.group}</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              {locales.map((locale) => (
                <LocaleField
                  key={locale}
                  row={row}
                  locale={locale}
                  onDirty={() => setDirty(true)}
                  onSaved={() => setDirty(false)}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LocaleField({
  row,
  locale,
  onDirty,
  onSaved,
}: {
  row: UiOverrideRow;
  locale: Locale;
  onDirty: () => void;
  onSaved: () => void;
}) {
  const current = row.values[locale] ?? row.defaults[locale];
  const missing = row.values[locale] === null;
  const changed = row.dirtyDefaults[locale];
  return (
    <div className="grid gap-2">
    <ActionForm
      action={saveUiStringAction}
      className="grid gap-2"
      onSuccess={onSaved}
    >
      <FormStatus />
      <label className="text-xs font-semibold uppercase tracking-wide text-navy-950">
        {locale.toUpperCase()}
        {missing ? <span className="ml-2 font-normal text-amber-800">eksik (varsayılan)</span> : null}
        {changed ? <span className="ml-2 font-normal text-emerald-800">özel</span> : null}
      </label>
      <input type="hidden" name="key" value={row.key} />
      <input type="hidden" name="locale" value={locale} />
      <textarea
        name="value"
        defaultValue={current}
        rows={3}
        onChange={onDirty}
        className="w-full rounded border border-line px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <SubmitButton>Kaydet</SubmitButton>
      </div>
    </ActionForm>
      {row.values[locale] !== null ? (
        <ActionForm action={restoreUiStringAction} className="mt-1">
          <input type="hidden" name="key" value={row.key} />
          <input type="hidden" name="locale" value={locale} />
          <SubmitButton variant="secondary">Varsayılan</SubmitButton>
        </ActionForm>
      ) : null}
    </div>
  );
}
