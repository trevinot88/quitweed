"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <button
        ref={ref}
        role="checkbox"
        aria-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 active:scale-90",
          checked
            ? "border-emerald-400 bg-emerald-500/90 text-emerald-950 shadow-lg shadow-emerald-500/30"
            : "border-white/15 bg-white/[0.03]",
          className
        )}
        {...props}
      >
        <Check
          className={cn(
            "h-4 w-4 transition-all",
            checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
