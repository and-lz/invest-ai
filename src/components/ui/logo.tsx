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
      width={100}
      height={100}
      className={cn("size-[100px] shrink-0 rounded-full", className)}
      aria-hidden
    />
  );
}
