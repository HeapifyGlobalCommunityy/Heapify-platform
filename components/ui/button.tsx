import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap font-sans font-medium",
    "transition-all duration-200 cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-white rounded-full",
          "shadow-[0_2px_12px_-4px_rgba(255,122,0,0.40)]",
          "hover:bg-primary-hover hover:-translate-y-0.5",
          "hover:shadow-[0_8px_28px_-6px_rgba(255,122,0,0.55)]",
          "active:translate-y-0 active:shadow-none",
        ].join(" "),

        ghost: [
          "border border-border/90 bg-card/70 text-foreground/85 rounded-full backdrop-blur-sm",
          "hover:border-primary/45 hover:bg-primary/8 hover:text-primary",
          "hover:-translate-y-0.5",
          "active:translate-y-0",
        ].join(" "),

        outline: [
          "border-2 border-foreground/20 bg-transparent text-foreground rounded-full",
          "hover:border-primary hover:text-primary",
          "hover:-translate-y-0.5",
        ].join(" "),

        warm: [
          "bg-parchment-200 text-espresso-900 border border-parchment-300 rounded-full",
          "hover:bg-parchment-300 hover:border-primary/30 hover:-translate-y-0.5",
          "shadow-warm",
        ].join(" "),

        link: "text-primary underline-offset-4 hover:underline rounded",
      },
      size: {
        xs: "h-8  px-4 text-xs  gap-1.5",
        sm: "h-9  px-5 text-sm  gap-2",
        md: "h-11 px-6 text-sm  gap-2",
        lg: "h-12 px-8 text-base gap-2.5",
        xl: "h-14 px-10 text-lg gap-3",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
