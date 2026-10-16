import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "./cn";
import { ArrowRightIcon } from "./icons";

type Variant = "primary" | "secondary" | "light" | "outline-light";
type Size = "sm" | "md";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  className?: string;
  children: ReactNode;
};

type LinkButtonProps = CommonProps &
  Omit<ComponentProps<typeof Link>, keyof CommonProps | "href"> & { href: string };

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

const base =
  "inline-flex items-center justify-center gap-3 rounded-[3px] font-medium tracking-[0.01em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-gold-400 text-navy-950 hover:bg-gold-300",
  secondary:
    "border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-paper",
  light: "bg-paper text-navy-950 hover:bg-white",
  "outline-light":
    "border border-paper/70 text-paper hover:border-paper hover:bg-paper hover:text-navy-950",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.9375rem]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(base, variants[variant], sizes[size]);
}

export function Button({
  variant = "primary",
  size = "md",
  withArrow,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(buttonClasses(variant, size), className);
  const content = (
    <>
      <span>{children}</span>
      {withArrow ? <ArrowRightIcon className="size-4 shrink-0" /> : null}
    </>
  );

  if (rest.href !== undefined) {
    return (
      <Link {...(rest as Omit<LinkButtonProps, keyof CommonProps>)} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      {...(rest as Omit<NativeButtonProps, keyof CommonProps>)}
      className={classes}
    >
      {content}
    </button>
  );
}
