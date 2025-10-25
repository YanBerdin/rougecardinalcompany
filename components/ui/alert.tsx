import * as React from "react";
import { cn } from "@/lib/utils";

type AlertProps = React.HTMLAttributes<HTMLDivElement>;

export function Alert({ className, children, ...props }: AlertProps) {
  return (
    <div
      className={cn("relative w-full rounded-lg border p-4", className)}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
}

type AlertTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function AlertTitle({ className, children, ...props }: AlertTitleProps) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h5>
  );
}

type AlertDescriptionProps = React.HTMLAttributes<HTMLDivElement>;

export function AlertDescription({
  className,
  children,
  ...props
}: AlertDescriptionProps) {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props}>
      {children}
    </div>
  );
}
