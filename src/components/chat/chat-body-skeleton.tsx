import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function MessageBubbleSkeleton({ fullscreen: fs, contentLines }: {
  readonly role: "user" | "assistant"; readonly fullscreen: boolean;
  readonly contentLines: readonly string[];
}) {
  return (
    <div className={cn("w-full space-y-2", fs ? "py-2" : "py-1.5")}>
      {contentLines.map((w, i) => <Skeleton key={i} className={cn("rounded", w, fs ? "h-4" : "h-3.5")} />)}
    </div>
  );
}
