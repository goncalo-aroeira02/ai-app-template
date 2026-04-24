import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "accent";
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-dark text-white hover:bg-dark/90",
        variant === "accent" &&
          "bg-accent text-dark font-semibold hover:bg-accent/80",
        variant === "ghost" &&
          "border border-dark/20 text-dark hover:bg-dark/5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
