"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <ul className="grid gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-10 items-center rounded-md px-3 text-sm transition-colors ${
                active ? "bg-white/10 font-medium text-paper" : "text-on-dark-muted hover:bg-white/5 hover:text-paper"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Items are filtered by permission on the server; this only renders them. */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Yönetim menüsü" className="on-dark">
      <NavLinks items={items} pathname={pathname} />
    </nav>
  );
}

/** Modal drawer for small screens. */
export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    drawerRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-10 items-center rounded-md border border-line px-3 text-sm font-medium text-navy-950 lg:hidden"
        onClick={() => drawerRef.current?.showModal()}
      >
        Menü
      </button>
      <dialog
        ref={drawerRef}
        aria-label="Yönetim menüsü"
        className="on-dark m-0 h-full max-h-none w-72 max-w-[85vw] bg-navy-950 p-4 text-paper backdrop:bg-navy-950/60"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide">NUMAN GROUPE</span>
          <button
            type="button"
            className="min-h-10 rounded-md px-3 text-sm text-on-dark-muted hover:text-paper"
            onClick={() => drawerRef.current?.close()}
          >
            Kapat
          </button>
        </div>
        <nav aria-label="Yönetim menüsü (mobil)">
          <NavLinks items={items} pathname={pathname} />
        </nav>
      </dialog>
    </>
  );
}
