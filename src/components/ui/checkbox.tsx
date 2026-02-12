"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

function Checkbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  ...props
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={props["aria-label"]}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "border-primary bg-background inline-flex h-5 w-5 items-center justify-center rounded-md border transition-all",
        "hover:border-primary/80 hover:bg-primary/5",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        disabled && "pointer-events-none opacity-50",
        checked && "border-primary bg-primary text-primary-foreground",
        className,
      )}
    >
      {checked && <Check className="h-4 w-4" />}
    </button>
  );
}

export { Checkbox };
