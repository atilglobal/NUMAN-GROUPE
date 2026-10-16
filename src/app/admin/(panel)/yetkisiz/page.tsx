import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/auth/session";
import { buttonClass } from "@/components/admin/button-styles";

export const metadata: Metadata = { title: "Yetkisiz erişim" };

export default async function ForbiddenPage() {
  await requireUser();
  return (
    <div className="max-w-xl rounded-lg border border-line bg-white p-6">
      <h1 className="text-lg font-semibold text-navy-950">Bu sayfaya erişim yetkiniz yok</h1>
      <p className="mt-2 text-sm text-muted">
        Hesabınızın rolü bu işlem için yeterli değil. Erişim gerekiyorsa bir yöneticiye başvurun.
      </p>
      <Link href="/admin" className={`${buttonClass("primary")} mt-4`}>
        Gösterge paneline dön
      </Link>
    </div>
  );
}
