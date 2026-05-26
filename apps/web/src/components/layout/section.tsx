import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  size?: "sm" | "md" | "lg" | "xl" | "none";
}

export function Section({
  className,
  size = "md",
  ...props
}: SectionProps) {
  const paddingClasses = {
    none: "py-0",
    sm: "py-8 sm:py-12",
    md: "py-12 sm:py-16",
    lg: "py-16 sm:py-24",
    xl: "py-24 sm:py-32",
  };

  return (
    <section
      className={cn(
        "w-full transition-colors duration-200",
        paddingClasses[size],
        className
      )}
      {...props}
    />
  );
}
