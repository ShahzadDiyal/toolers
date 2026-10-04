import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Job-site input: dark inset panel, large mono numerals, amber focus ring.
 * Pair with <Label> and an optional unit badge.
 */
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-md border border-input bg-zinc-950 px-4 py-2 text-base tnum shadow-[inset_0_2px_8px_rgb(0_0_0/0.55)]",
      "placeholder:text-zinc-600 text-zinc-50 transition-colors",
      "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
