"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type LocaleTab = { id: string; label: string; status: ReactNode; content: ReactNode; hasError?: boolean };

/**
 * Accessible FR / EN / TR tabs (arrow keys, Home, End). Every panel stays
 * mounted, so switching language never discards unsaved input.
 */
export function LocaleTabs({ tabs, label }: { tabs: LocaleTab[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === active);
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((tab, index) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={`-mb-px flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-4 text-sm ${
                selected ? "border-navy-950 font-semibold text-navy-950" : "border-transparent text-muted hover:text-navy-950"
              }`}
            >
              {tab.label}
              {tab.status}
              {tab.hasError ? <span className="text-xs font-medium text-red-700">Hata</span> : null}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active}
          className="pt-5"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
