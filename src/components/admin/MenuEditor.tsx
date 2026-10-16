"use client";

import { useState } from "react";
import { saveMenuAction } from "@/admin/actions/menus";
import { menuSectionOptions, type MenuEditorItem } from "@/admin/menus";
import { locales } from "@/i18n/config";
import { ActionForm, FormStatus, SubmitButton } from "./forms";

export function MenuEditor({
  location,
  items: initial,
  pages,
}: {
  location: "header" | "footer";
  items: MenuEditorItem[];
  pages: { id: string; title: string }[];
}) {
  const [items, setItems] = useState(initial);
  const action = saveMenuAction.bind(null, location);

  function add(kind: MenuEditorItem["kind"]) {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        parentId: null,
        sortOrder: current.length,
        kind,
        sectionKey: kind === "section" ? "about" : null,
        cmsPageId: kind === "cms_page" ? (pages[0]?.id ?? null) : null,
        externalUrl: kind === "url" ? "https://" : null,
        labels: { fr: "", en: "", tr: "" },
      },
    ]);
  }

  return (
    <ActionForm action={action} className="grid gap-4">
      <FormStatus />
      <input type="hidden" name="items" value={JSON.stringify(items.map((item, index) => ({ ...item, sortOrder: index })))} />
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.id} className="grid gap-2 rounded border border-line p-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <select
                value={item.kind}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((row) => (row.id === item.id ? { ...row, kind: event.target.value as MenuEditorItem["kind"] } : row)),
                  )
                }
                className="rounded border border-line px-2 py-1"
              >
                <option value="section">Bölüm</option>
                <option value="cms_page">İçerik sayfası</option>
                <option value="url">Harici https</option>
              </select>
              {item.kind === "section" ? (
                <select
                  value={item.sectionKey ?? "about"}
                  onChange={(event) =>
                    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, sectionKey: event.target.value } : row)))
                  }
                  className="rounded border border-line px-2 py-1"
                >
                  {menuSectionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : null}
              {item.kind === "cms_page" ? (
                <select
                  value={item.cmsPageId ?? ""}
                  onChange={(event) =>
                    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, cmsPageId: event.target.value } : row)))
                  }
                  className="rounded border border-line px-2 py-1"
                >
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.title}
                    </option>
                  ))}
                </select>
              ) : null}
              {item.kind === "url" ? (
                <input
                  value={item.externalUrl ?? ""}
                  onChange={(event) =>
                    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, externalUrl: event.target.value } : row)))
                  }
                  className="min-w-[16rem] rounded border border-line px-2 py-1"
                />
              ) : null}
              <button type="button" className="ml-auto text-xs underline" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id && row.parentId !== item.id))}>
                Kaldır
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {locales.map((locale) => (
                <input
                  key={locale}
                  placeholder={`Etiket ${locale.toUpperCase()}`}
                  value={item.labels[locale] ?? ""}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((row) =>
                        row.id === item.id ? { ...row, labels: { ...row.labels, [locale]: event.target.value } } : row,
                      ),
                    )
                  }
                  className="rounded border border-line px-2 py-1 text-sm"
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded border border-line px-3 py-1 text-xs" onClick={() => add("section")}>
          Bölüm ekle
        </button>
        <button type="button" className="rounded border border-line px-3 py-1 text-xs" onClick={() => add("cms_page")}>
          Sayfa ekle
        </button>
        <button type="button" className="rounded border border-line px-3 py-1 text-xs" onClick={() => add("url")}>
          Harici bağlantı
        </button>
      </div>
      <SubmitButton>Menüyü kaydet</SubmitButton>
    </ActionForm>
  );
}
