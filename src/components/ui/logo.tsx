import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand logo mark — Fortuna goddess icon for header use.
 * Clipped to circle for consistent shape.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/fortuna.png"
      alt="Fortuna"
      width={50}
      height={50}
      className={cn("shrink-0 rounded-full", className)}
      aria-hidden
    />
  );
}
