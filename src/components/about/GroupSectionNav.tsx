"use client";

import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";

export type GroupNavItem = { id: string; label: string };

export function GroupSectionNav({ items, label }: { items: GroupNavItem[]; label: string }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setCurrent(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0.1, 0.25] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={label}
      className="sticky top-[var(--header-height)] z-40 border-b border-line/80 bg-paper/95 backdrop-blur-sm motion-reduce:backdrop-blur-none"
    >
      <div className="mx-auto flex w-full max-w-site items-center px-5 sm:px-8 lg:px-10">
        <div className="lg:hidden">
          <button
            type="button"
            className="flex min-h-11 items-center py-2 text-sm font-medium text-navy-950"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {items.find((item) => item.id === current)?.label ?? items[0]?.label}
          </button>
        </div>
        <ul
          className={cn(
            "flex w-full flex-col gap-1 py-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-4 lg:gap-y-1 lg:py-3",
            open ? "flex" : "hidden lg:flex",
          )}
        >
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "inline-flex min-h-10 items-center text-sm underline-offset-4 hover:underline",
                  current === item.id ? "font-medium text-navy-950" : "text-muted hover:text-navy-950",
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
