import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva(
  "tracking-tight font-sans transition-colors duration-200",
  {
    variants: {
      variant: {
        h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        h2: "scroll-m-20 border-b border-border/40 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
        h4: "scroll-m-20 text-xl font-semibold tracking-tight",
        h5: "scroll-m-20 text-lg font-semibold tracking-tight",
        h6: "scroll-m-20 text-base font-semibold tracking-tight",
        gradient: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl gradient-text bg-clip-text text-transparent bg-gradient-to-r from-veda-purple-500 to-veda-indigo-500",
      },
    },
    defaultVariants: {
      variant: "h1",
    },
  }
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function Heading({ className, variant, as, ...props }: HeadingProps) {
  const Component = as || (variant === "gradient" ? "h1" : (variant as "h1" | "h2" | "h3" | "h4" | "h5" | "h6") || "h1");
  return (
    <Component
      className={cn(headingVariants({ variant, className }))}
      {...props}
    />
  );
}

const textVariants = cva(
  "font-sans transition-colors duration-200",
  {
    variants: {
      variant: {
        lead: "text-xl text-muted-foreground font-light",
        p: "leading-7 [&:not(:first-child)]:mt-6",
        large: "text-lg font-semibold",
        small: "text-sm font-medium leading-none",
        muted: "text-sm text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "p",
    },
  }
);

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div";
}

export function Text({ className, variant, as = "p", ...props }: TextProps) {
  const Component = as;
  return (
    <Component
      className={cn(textVariants({ variant, className }))}
      {...props}
    />
  );
}

export function Code({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground/80 dark:text-foreground/90 border border-border/40",
        className
      )}
      {...props}
    />
  );
}
