import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand logo mark — Fortuna goddess icon for header use.
 * Clipped to circle to hide the black background corners.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/fortuna-icon.png"
      alt="Fortuna"
      width={24}
      height={24}
      className={cn("h-6 w-6 shrink-0 rounded-full", className)}
      aria-hidden
    />
  );
}
