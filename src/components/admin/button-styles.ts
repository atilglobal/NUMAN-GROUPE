const buttonStyles = {
  primary: "bg-navy-950 text-paper hover:bg-navy-800",
  secondary: "border border-line bg-white text-navy-950 hover:bg-paper",
  danger: "bg-red-700 text-white hover:bg-red-800",
} as const;

export type ButtonVariant = keyof typeof buttonStyles;

/** Shared by Server and Client Components, so it must stay out of "use client" files. */
export function buttonClass(variant: ButtonVariant = "primary") {
  return `inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant]}`;
}
