import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Job-site input: clean light field, large mono numerals, orange focus ring.
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
      "flex h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-base tnum shadow-[inset_0_1px_3px_rgb(11_27_51/0.06)]",
      "placeholder:text-zinc-400 text-[#0B1B33] transition-colors",
      "hover:border-zinc-400",
      "focus-visible:outline-none focus-visible:border-[#ED7D22] focus-visible:ring-2 focus-visible:ring-[#ED7D22]/30",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-100",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
