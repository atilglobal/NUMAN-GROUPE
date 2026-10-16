import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-4">
      <div className="max-w-md rounded-lg border border-line bg-white p-6">
        <h1 className="text-lg font-semibold text-navy-950">Kayıt bulunamadı</h1>
        <p className="mt-2 text-sm text-muted">Aradığınız sayfa veya kayıt yok ya da silinmiş.</p>
        <Link href="/admin" className="mt-4 inline-block text-sm text-navy-950 underline underline-offset-4">
          Gösterge paneline dön
        </Link>
      </div>
    </main>
  );
}
