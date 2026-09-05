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
        "rounded-2xl border border-border bg-surface shadow-sm",
        interactive &&
          "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-brand-500/40",
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
