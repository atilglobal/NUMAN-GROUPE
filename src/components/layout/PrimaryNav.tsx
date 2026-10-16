"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import { isActivePath, type NavItem } from "./nav";

export function PrimaryNav({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="hidden lg:block">
      <ul className="flex items-center gap-7 xl:gap-9">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-10 items-center text-[0.875rem] transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-1.5 after:h-px after:origin-left after:bg-gold-500 after:transition-transform",
                  active
                    ? "text-navy-950 after:scale-x-100"
                    : "text-ink/80 after:scale-x-0 hover:text-navy-950 hover:after:scale-x-100",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
