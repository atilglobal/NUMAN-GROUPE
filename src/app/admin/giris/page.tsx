import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/session";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Giriş" };

async function RedirectIfSignedIn() {
  if (await getCurrentUser()) redirect("/admin");
  return null;
}

export default function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-700">NUMAN GROUPE</p>
        <h1 className="mt-2 text-xl font-semibold text-navy-950">Yönetim paneli girişi</h1>
        <p className="mt-1 text-sm text-muted">Yalnızca yetkili kullanıcılar içindir.</p>
        <Suspense fallback={null}>
          <RedirectIfSignedIn />
        </Suspense>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-xs text-muted">
          Parolanızı unuttuysanız bir yöneticiden sıfırlamasını isteyin. Kayıt yoluyla hesap açılamaz.
        </p>
      </div>
    </main>
  );
}
