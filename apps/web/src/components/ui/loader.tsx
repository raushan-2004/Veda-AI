import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const loaderVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
      color: {
        primary: "text-primary",
        secondary: "text-secondary",
        accent: "text-accent",
        muted: "text-muted-foreground",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
    },
  }
);

export interface LoaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof loaderVariants> {
  variant?: "spinner" | "pulse" | "bar";
}

export function Loader({
  className,
  size,
  color,
  variant = "spinner",
  ...props
}: LoaderProps) {
  if (variant === "pulse") {
    const dotSizes = {
      xs: "h-1 w-1 mx-0.5",
      sm: "h-1.5 w-1.5 mx-0.5",
      md: "h-2.5 w-2.5 mx-1",
      lg: "h-4 w-4 mx-1.5",
      xl: "h-5 w-5 mx-2",
    };

    const activeDotSize = dotSizes[size || "md"];

    const dotColors = {
      primary: "bg-primary",
      secondary: "bg-secondary",
      accent: "bg-accent",
      muted: "bg-muted-foreground",
      white: "bg-white",
    };

    const activeDotColor = dotColors[(color as keyof typeof dotColors) || "primary"];

    return (
      <div
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <div
          className={cn("rounded-full animate-bounce delay-100", activeDotSize, activeDotColor)}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={cn("rounded-full animate-bounce delay-200", activeDotSize, activeDotColor)}
          style={{ animationDelay: "150ms" }}
        />
        <div
          className={cn("rounded-full animate-bounce delay-300", activeDotSize, activeDotColor)}
          style={{ animationDelay: "300ms" }}
        />
      </div>
    );
  }

  if (variant === "bar") {
    const heights = {
      xs: "h-0.5",
      sm: "h-1",
      md: "h-1.5",
      lg: "h-2.5",
      xl: "h-3",
    };

    const activeHeight = heights[size || "md"];

    const bgColors = {
      primary: "from-veda-purple-500 to-veda-indigo-500",
      secondary: "from-secondary to-muted-foreground",
      accent: "from-veda-indigo-500 to-veda-purple-500",
      muted: "from-muted to-muted-foreground",
      white: "from-white/40 to-white",
    };

    return (
      <div
        className={cn(
          "w-full overflow-hidden bg-muted rounded-full relative",
          activeHeight,
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r shimmer w-1/2 animate-shimmer",
            bgColors[(color as keyof typeof bgColors) || "primary"]
          )}
          style={{
            animationDuration: "1.5s",
          }}
        />
      </div>
    );
  }

  // Default: Spinner
  return (
    <div
      className={cn(loaderVariants({ size, color: color as any }), className)}
      {...props}
    >
      <svg
        className="animate-spin h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
