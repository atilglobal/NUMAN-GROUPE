import type { ReactNode } from "react";

type MarkProps = { className?: string };

const stroke = {
  ariaHidden: true as const,
  focusable: false as const,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
};

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg {...stroke} className={className ?? "size-6"}>
      {children}
    </svg>
  );
}

export function PlanMark({ className }: MarkProps) {
  return (
    <Frame className={className}>
      <path d="M4.5 6.5h15M4.5 12h15M4.5 17.5h9" strokeLinecap="round" />
    </Frame>
  );
}

export function PathMark({ className }: MarkProps) {
  return (
    <Frame className={className}>
      <path d="M5 19V8.5A3.5 3.5 0 0 1 8.5 5H19" strokeLinecap="round" />
      <path d="M15 5l4 0 0 4" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

export function RoomsMark({ className }: MarkProps) {
  return (
    <Frame className={className}>
      <path d="M5 19V5h14v14H5Z" />
      <path d="M5 12h14M12 5v14" />
    </Frame>
  );
}

export function AccessMark({ className }: MarkProps) {
  return (
    <Frame className={className}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8.5v3.5l2.5 1.5" strokeLinecap="round" />
    </Frame>
  );
}

export function LightMark({ className }: MarkProps) {
  return (
    <Frame className={className}>
      <path d="M8 14.5a4 4 0 1 1 8 0c0 1.6-.8 2.4-1.5 3.2-.4.5-.5 1-.5 1.8h-4c0-.8-.1-1.3-.5-1.8C8.8 16.9 8 16.1 8 14.5Z" />
      <path d="M10 20.5h4" strokeLinecap="round" />
    </Frame>
  );
}

export function BuildMark({ className }: MarkProps) {
  return (
    <Frame className={className}>
      <path d="M4.5 19.5h15M7 19.5V9l5-3.5 5 3.5v10.5" strokeLinejoin="round" />
      <path d="M10.5 19.5v-4h3v4" />
    </Frame>
  );
}

const MARKS = [PlanMark, PathMark, RoomsMark, AccessMark, LightMark, BuildMark];

export function ExpertiseMark({ index, className }: { index: number; className?: string }) {
  const Icon = MARKS[index % MARKS.length] ?? PlanMark;
  return <Icon className={className} />;
}
