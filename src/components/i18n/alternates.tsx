"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";

type Alternates = Partial<Record<Locale, string>>;

const AlternatesContext = createContext<{
  alternates: Alternates | null;
  setAlternates: (value: Alternates | null) => void;
}>({ alternates: null, setAlternates: () => {} });

export function AlternatesProvider({ children }: { children: ReactNode }) {
  const [alternates, setAlternates] = useState<Alternates | null>(null);
  return (
    <AlternatesContext value={{ alternates, setAlternates }}>{children}</AlternatesContext>
  );
}

/** Lets a page tell the language switcher where its exact translations live. */
export function PageAlternates({ alternates }: { alternates: Alternates }) {
  const { setAlternates } = useContext(AlternatesContext);
  const key = JSON.stringify(alternates);

  useEffect(() => {
    setAlternates(JSON.parse(key) as Alternates);
    return () => setAlternates(null);
  }, [key, setAlternates]);

  return null;
}

export function usePageAlternates(): Alternates | null {
  return useContext(AlternatesContext).alternates;
}
