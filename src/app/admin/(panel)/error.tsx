"use client";

import { buttonClass } from "@/components/admin/button-styles";

export default function PanelError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
  return (
    <div role="alert" className="max-w-xl rounded-lg border border-red-200 bg-white p-6">
      <h1 className="text-lg font-semibold text-navy-950">Bu sayfa yüklenemedi</h1>
      <p className="mt-2 text-sm text-muted">
        Beklenmeyen bir hata oluştu. Yaptığınız son değişiklik kaydedilmemiş olabilir; lütfen yeniden deneyin.
        {error.digest ? ` Hata kodu: ${error.digest}` : null}
      </p>
      <button type="button" onClick={() => retry()} className={`${buttonClass("primary")} mt-4`}>
        Yeniden dene
      </button>
    </div>
  );
}
