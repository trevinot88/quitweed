"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/** Slider estilizado con accent esmeralda. Usa un input range nativo. */
const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 1, max = 10, step = 1, ...props }, ref) => {
    const pct = ((Number(value ?? min) - min) / (max - min)) * 100;
    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange?.(Number(e.target.value))}
        className={cn(
          "sobrio-range",
          "bg-[linear-gradient(to_right,rgba(52,211,153,0.9)_0%,rgba(52,211,153,0.9)_var(--pct,50%),rgba(255,255,255,0.08)_var(--pct,50%),rgba(255,255,255,0.08)_100%)]",
          className
        )}
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
        {...props}
      />
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
