import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { signOutAction } from "@/admin/actions/auth";
import { can, roleLabels, type Permission } from "@/auth/permissions";
import { requireUser } from "@/auth/session";
import { buttonClass } from "@/components/admin/button-styles";
import { MobileNav, SidebarNav, type NavItem } from "@/components/admin/PanelNav";
import { PanelSkeleton } from "@/components/admin/ui";

const navigation: (NavItem & { permission?: Permission })[] = [
  { href: "/admin", label: "Gösterge paneli" },
  { href: "/admin/uzmanliklar", label: "Uzmanlık alanları", permission: "content:write" },
  { href: "/admin/projeler", label: "Projeler", permission: "content:write" },
  { href: "/admin/ziyaretler", label: "Resmî ziyaretler", permission: "content:write" },
  { href: "/admin/kadro", label: "Kadro", permission: "content:write" },
  { href: "/admin/sayfalar", label: "Kurumsal içerikler", permission: "content:write" },
  { href: "/admin/icerik-sayfalari", label: "Sayfalar", permission: "content:write" },
  { href: "/admin/ceviriler", label: "Dil ve çeviri", permission: "content:write" },
  { href: "/admin/menuler", label: "Menüler", permission: "content:write" },
  { href: "/admin/ana-sayfa", label: "Ana sayfa", permission: "content:write" },
  { href: "/admin/medya", label: "Medya kütüphanesi", permission: "media:write" },
  { href: "/admin/talepler", label: "Talepler", permission: "inquiries:read" },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", permission: "users:manage" },
  { href: "/admin/ayarlar", label: "Site ayarları", permission: "settings:manage" },
  { href: "/admin/hesap", label: "Hesabım" },
];

function Brand() {
  return (
    <Link href="/admin" className="block text-sm font-semibold tracking-[0.18em] text-paper">
      NUMAN GROUPE
      <span className="mt-0.5 block text-xs font-normal tracking-normal text-on-dark-muted">Yönetim paneli</span>
    </Link>
  );
}

/** The session is read per request, so the shell streams in behind Suspense. */
async function PanelShell({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const items = navigation
    .filter((item) => !item.permission || can(user.role, item.permission))
    .map(({ href, label }) => ({ href, label }));

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-svh flex-col gap-8 bg-navy-950 p-4 lg:flex">
        <div className="px-3 pt-2">
          <Brand />
        </div>
        <SidebarNav items={items} />
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-line bg-white px-4 py-3 sm:px-6">
          <MobileNav items={items} />
          <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
            <p className="text-sm">
              <span className="font-medium text-navy-950">{user.name}</span>
              <span className="ml-2 rounded bg-paper-2 px-2 py-0.5 text-xs text-navy-900">{roleLabels[user.role]}</span>
            </p>
            <a href="/fr" target="_blank" rel="noopener" className="text-sm text-muted underline-offset-4 hover:underline">
              Siteyi görüntüle
            </a>
            <form action={signOutAction}>
              <button type="submit" className={buttonClass("secondary")}>
                Çıkış yap
              </button>
            </form>
          </div>
        </header>
        <main id="main" className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense
      fallback={
        <div className="p-4 sm:p-6 lg:p-8">
          <PanelSkeleton />
        </div>
      }
    >
      <PanelShell>{children}</PanelShell>
    </Suspense>
  );
}
