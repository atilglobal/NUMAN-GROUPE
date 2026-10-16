"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import type { NavItem } from "./nav";
import { isActivePath } from "./nav";

type MobileMenuProps = {
  items: NavItem[];
  navLabel: string;
  openLabel: string;
  closeLabel: string;
  footer: ReactNode;
};

export function MobileMenu({ items, navLabel, openLabel, closeLabel, footer }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Navigating to another page closes the menu.
  const isOpen = open && openedAt === pathname;

  useEffect(() => {
    if (!isOpen) return;

    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = [
        toggleRef.current,
        ...panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), select, textarea, input"),
      ].filter((node): node is HTMLElement => Boolean(node));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => {
          setOpen(!isOpen);
          setOpenedAt(pathname);
        }}
        className="grid size-11 place-items-center rounded-[3px] text-navy-950 hover:bg-paper-2"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
        <span className="sr-only">{isOpen ? closeLabel : openLabel}</span>
      </button>

      <div
        ref={panelRef}
        id={panelId}
        hidden={!isOpen}
        className="fixed inset-x-0 bottom-0 top-[var(--header-height)] z-40 overflow-y-auto border-t border-line bg-paper"
      >
        <nav aria-label={navLabel} className="px-5 pb-10 pt-4 sm:px-8">
          <ul className="divide-y divide-line">
            {items.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-14 items-center font-serif text-2xl",
                      active ? "text-gold-700" : "text-navy-950",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-8">{footer}</div>
        </nav>
      </div>
    </div>
  );
}
