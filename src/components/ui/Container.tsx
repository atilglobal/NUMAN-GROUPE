import type { ElementType, ReactNode } from "react";
import { cn } from "./cn";

type ContainerProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function Container({ as: Tag = "div", className, children }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-site px-5 sm:px-8 lg:px-10", className)}>
      {children}
    </Tag>
  );
}
