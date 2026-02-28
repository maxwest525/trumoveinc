import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/85 hover:shadow-[0_4px_12px_hsl(var(--foreground)/0.15)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Unified secondary outline: subtle border, NO green text on hover, subtle border/glow accent
        outline: "border border-border bg-transparent text-foreground hover:border-primary/40 hover:shadow-[0_0_8px_hsl(var(--primary)/0.08)]",
        secondary: "border border-border bg-muted/50 text-foreground hover:border-primary/40 hover:shadow-[0_0_8px_hsl(var(--primary)/0.08)]",
        ghost: "hover:bg-accent/50 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Premium dark button with subtle glow
        premium: "bg-foreground text-background hover:bg-primary hover:text-foreground shadow-[0_4px_16px_hsl(var(--primary)/0.15)] hover:shadow-[0_8px_24px_hsl(var(--primary)/0.25)] transition-all duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-12 rounded-xl px-10 text-base font-bold",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
