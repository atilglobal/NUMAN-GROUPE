import type { ElementType, ReactNode } from "react";
import { cn } from "./cn";

type ContainerProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  maxWidthClass?: string;
};

export function Container({ as: Tag = "div", className, children, maxWidthClass = "max-w-site" }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full px-5 sm:px-8 lg:px-10", maxWidthClass, className)}>
      {children}
    </Tag>
  );
}
