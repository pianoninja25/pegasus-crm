"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[0_6px_18px_-10px_hsl(var(--primary)/0.45)] hover:shadow-[0_10px_24px_-12px_hsl(var(--primary)/0.55),0_0_var(--glow-size)_hsl(var(--glow)/var(--glow-opacity))] hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-secondary/60 text-secondary-foreground border border-border backdrop-blur-md hover:bg-secondary/80 hover:border-primary/40",
        destructive:
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive shadow-[0_8px_24px_-10px_hsl(var(--destructive)/0.6)]",
        outline:
          "border border-border bg-card/40 backdrop-blur-md text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5",
        ghost:
          "text-foreground/80 hover:text-foreground hover:bg-foreground/5",
        link: "text-primary underline-offset-4 hover:underline",
        glow:
          "bg-card/60 backdrop-blur-md border border-primary/40 text-foreground shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5",
        glass:
          "glass text-foreground hover:border-primary/60 hover:text-primary hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-9 text-base",
        icon: "h-10 w-10",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
