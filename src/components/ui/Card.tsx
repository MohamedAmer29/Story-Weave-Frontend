import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export function Card({ children, className, interactive, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.6rem] border border-border bg-surface shadow-[0_10px_30px_rgba(55,38,24,0.04)]",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/35 hover:shadow-[0_22px_50px_rgba(55,38,24,0.1)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 pb-3", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 pt-5 ", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t border-border p-4", className)} {...rest}>
      {children}
    </div>
  );
}
