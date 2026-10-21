"use client";

import { useState } from "react";
import { uploadImageAction } from "@/admin/actions/media";
import { GALLERY_UPLOAD_CONCURRENCY } from "@/media/gallery-limits";
import { buttonClass } from "./button-styles";

type Row = {
  id: string;
  file: File;
  status: "queued" | "uploading" | "ok" | "error";
  message: string;
};

export function MediaBatchUpload() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      status: "queued" as const,
      message: "Sırada",
    }));
    setRows((current) => [...current, ...next]);
  }

  async function uploadOne(row: Row) {
    setRows((current) =>
      current.map((item) => (item.id === row.id ? { ...item, status: "uploading", message: "Yükleniyor…" } : item)),
    );
    const formData = new FormData();
    formData.set("file", row.file);
    formData.set("altFr", "");
    formData.set("altEn", "");
    formData.set("altTr", "");
    formData.set("captionFr", "");
    formData.set("captionEn", "");
    formData.set("captionTr", "");
    try {
      const result = await uploadImageAction({ ok: false }, formData);
      setRows((current) =>
        current.map((item) =>
          item.id === row.id
            ? {
                ...item,
                status: result.ok ? "ok" : "error",
                message: result.message ?? (result.ok ? "Yüklendi" : "Yükleme başarısız."),
              }
            : item,
        ),
      );
    } catch {
      setRows((current) =>
        current.map((item) =>
          item.id === row.id ? { ...item, status: "error", message: "Yükleme başarısız." } : item,
        ),
      );
    }
  }

  async function run(queue: Row[]) {
    setBusy(true);
    let cursor = 0;
    async function worker() {
      while (cursor < queue.length) {
        const index = cursor;
        cursor += 1;
        const row = queue[index];
        if (row) await uploadOne(row);
      }
    }
    await Promise.all(Array.from({ length: Math.min(GALLERY_UPLOAD_CONCURRENCY, queue.length) }, () => worker()));
    setBusy(false);
  }

  const pending = rows.filter((row) => row.status === "queued" || row.status === "error");

  return (
    <div className="grid gap-3 rounded-md border border-dashed border-line bg-paper/40 p-4">
      <p className="text-sm font-medium text-navy-950">Yeni görsel ekle</p>
      <p className="text-xs text-muted">
        Birden fazla dosya seçilebilir. Dosyalar küçük gruplar halinde yüklenir; başarısız olanlar ayrı denenebilir.
        JPEG, PNG, WebP veya GIF — dosya başına en fazla 6 MB.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className={`${buttonClass("primary")} cursor-pointer`}>
          Dosya seç
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          className={buttonClass("secondary")}
          disabled={busy || pending.length === 0}
          onClick={() => run(pending)}
        >
          {busy ? "Yükleniyor…" : pending.some((row) => row.status === "error") ? "Bekleyenleri / hatalıları yükle" : "Seçilenleri yükle"}
        </button>
      </div>
      {rows.length > 0 ? (
        <ul className="grid gap-1 text-sm">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 py-2">
              <span className="min-w-0 truncate text-ink">{row.file.name}</span>
              <span className={row.status === "error" ? "text-red-700" : row.status === "ok" ? "text-emerald-800" : "text-muted"}>
                {row.message}
              </span>
              {row.status === "error" ? (
                <button type="button" className="text-navy-950 underline underline-offset-2" disabled={busy} onClick={() => run([row])}>
                  Yeniden dene
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
