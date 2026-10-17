import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/auth/session";
import { SetupForm } from "@/components/setup/SetupForm";
import { tryGetDb } from "@/db/client";
import { publicSetupView } from "@/setup/run";

export const metadata: Metadata = {
  title: "Kurulum | NUMAN GROUPE",
  robots: { index: false, follow: false },
};

export const instant = false;

function Closed({ title, body }: { title: string; body: string }) {
  return (
    <main className="grid min-h-svh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">NUMAN GROUPE</p>
        <h1 className="mt-2 text-xl font-semibold text-navy-950">{title}</h1>
        <p className="mt-3 text-sm text-muted">{body}</p>
        <p className="mt-6 text-sm">
          <a className="text-gold-800 underline" href={LOGIN_PATH}>
            Yönetim girişi
          </a>
        </p>
      </div>
    </main>
  );
}

export default async function SetupPage() {
  await connection();
  const db = tryGetDb();
  const view = await publicSetupView(db);

  if (view.kind === "locked") redirect(LOGIN_PATH);
  if (view.kind === "closed") {
    return (
      <Closed
        title="Kurulum kapalı"
        body="Bu ortamda ilk kurulum kullanılamaz. Yönetici girişini kullanın."
      />
    );
  }
  if (view.kind === "admin_exists") {
    return (
      <Closed
        title="Kurulum kilitli"
        body="Bu veritabanında zaten bir yönetici var. Kurulum yeni hesap eklemez ve parolaları değiştirmez. Hesap kurtarma ayrı yapılır."
      />
    );
  }

  return (
    <main className="grid min-h-svh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">NUMAN GROUPE</p>
        <h1 className="mt-2 text-xl font-semibold text-navy-950">İlk kurulum</h1>
        <p className="mt-1 text-sm text-muted">
          Vercel’de tanımladığınız kurulum anahtarı ve ilk yönetici bilgileri. Anahtar adres çubuğuna yazılmaz.
        </p>
        <div className="mt-6">
          <SetupForm />
        </div>
        <p className="mt-6 text-xs text-muted">
          Başarılı kurulumdan sonra anahtarı Vercel Production ortamından kaldırın. Sonraki yayınlar bu formu yeniden açmaz.
        </p>
      </div>
    </main>
  );
}
