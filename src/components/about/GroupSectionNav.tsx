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
      { rootMargin: "-28% 0px -62% 0px", threshold: [0.08, 0.2] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className="sticky top-[var(--header-height)] z-40 border-b border-line bg-paper">
      <div className="mx-auto w-full max-w-site px-5 sm:px-8 lg:px-10">
        <div className="lg:hidden">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between py-2 text-sm font-medium text-navy-950"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span>{items.find((item) => item.id === current)?.label ?? items[0]?.label}</span>
            <span aria-hidden="true" className="text-gold-700">
              {open ? "–" : "+"}
            </span>
          </button>
        </div>
        <ul
          className={cn(
            "flex flex-col gap-1 pb-2 lg:flex-row lg:flex-nowrap lg:items-center lg:gap-0 lg:overflow-x-auto lg:py-0",
            open ? "flex" : "hidden lg:flex",
          )}
        >
          {items.map((item) => (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                className={cn(
                  "inline-flex min-h-11 items-center border-b-2 px-0 text-[0.8rem] tracking-[0.01em] lg:px-3",
                  current === item.id
                    ? "border-gold-500 font-medium text-navy-950"
                    : "border-transparent text-muted hover:text-navy-950",
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
