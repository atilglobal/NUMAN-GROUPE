import type { ReactNode } from "react";
import type { GroupSectorKey } from "@/content/group-sectors";

type IconProps = { className?: string };

function Stroke({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      className={className ?? "size-8"}
    >
      {children}
    </svg>
  );
}

const ICONS: Record<GroupSectorKey, (props: IconProps) => ReactNode> = {
  institutional: ({ className }) => (
    <Stroke className={className}>
      <path d="M4 28h24M6 28V12l10-6 10 6v16M12 28v-8h8v8M16 6v4" strokeLinecap="round" strokeLinejoin="round" />
    </Stroke>
  ),
  health: ({ className }) => (
    <Stroke className={className}>
      <path d="M6 12h20v14H6zM10 12V8h12v4M16 16v8M12 20h8" strokeLinecap="round" strokeLinejoin="round" />
    </Stroke>
  ),
  sports: ({ className }) => (
    <Stroke className={className}>
      <ellipse cx="16" cy="16" rx="11" ry="7" />
      <path d="M16 9v14M5 16h22" strokeLinecap="round" />
    </Stroke>
  ),
  roads: ({ className }) => (
    <Stroke className={className}>
      <path d="M10 4l-4 24M22 4l4 24M16 8v3M16 15v3M16 22v3" strokeLinecap="round" />
    </Stroke>
  ),
  ports: ({ className }) => (
    <Stroke className={className}>
      <path d="M5 22h22M8 22V12h16l-3 10M12 12V8h8v4M6 26h20" strokeLinecap="round" strokeLinejoin="round" />
    </Stroke>
  ),
  defense: ({ className }) => (
    <Stroke className={className}>
      <path d="M16 5 6 10v8c0 6 4.5 9 10 10 5.5-1 10-4 10-10v-8z" strokeLinejoin="round" />
    </Stroke>
  ),
  urban: ({ className }) => (
    <Stroke className={className}>
      <path d="M5 28V14h8v14M13 28V8h8v20M21 28V16h6v12M8 18h2M16 12h2M24 20h2" strokeLinecap="round" />
    </Stroke>
  ),
};

export function SectorMark({ name, className }: { name: GroupSectorKey; className?: string }) {
  return ICONS[name]({ className });
}

export function ArchitecturalFrame({ label, caption }: { label: string; caption: string }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden border border-gold-400/40 bg-navy-900 sm:aspect-[5/4] lg:aspect-[4/5]">
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-gold-400/25" viewBox="0 0 400 500">
        <rect x="24" y="24" width="352" height="452" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="48" y="48" width="304" height="404" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M24 180h352M24 320h352M160 24v452M240 24v452" stroke="currentColor" strokeWidth="0.5" />
        <path d="M48 420 L200 80 L352 420" fill="none" stroke="currentColor" strokeWidth="0.8" />
      </svg>
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <p className="font-serif text-6xl leading-none text-paper sm:text-7xl">{label}</p>
        <p className="mt-3 max-w-xs text-sm uppercase tracking-[0.18em] text-gold-300">{caption}</p>
      </div>
    </div>
  );
}

export function RegionAtlas() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 640 280"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-gold-400/15 sm:h-52"
    >
      <path
        fill="currentColor"
        d="M118 168c18-28 42-40 70-36 22 3 36 18 58 16 16-2 24-16 42-18 28-4 48 20 78 14 22-4 28-22 48-24 26-2 44 16 70 10 18-4 30-18 50-14l-8 42c-24 8-46-4-70 2-28 6-38 28-66 32-26 4-40-14-64-10-22 4-30 22-52 24-28 4-48-16-78-8-20 6-32 20-54 18-16-2-26-14-44-12z"
      />
    </svg>
  );
}
