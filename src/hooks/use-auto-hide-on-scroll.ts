import { useRef, useMemo } from "react";
import { throttle } from "@/lib/throttle";

const THRESHOLD_HIDE = 50;
const THRESHOLD_SHOW = 25;
const NEAR_BOTTOM = 40; // px from bottom to force-show
const THROTTLE_MS = 16; // ~1 animation frame

export interface AutoHideTarget {
  ref: React.RefObject<HTMLElement | null>;
  hiddenClass: string;
}

/**
 * Auto-hides multiple elements based on scroll direction.
 * Uses direct DOM class toggling (no React state) to avoid re-renders.
 * Pair with CSS transform-based hide (not layout-affecting) to prevent jitter.
 */
export function useAutoHideOnScroll(targets: AutoHideTarget[]) {
  const anchorRef = useRef(0);
  const hiddenRef = useRef(false);

  const onScroll = useMemo(
    () =>
      throttle((e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        const delta = scrollTop - anchorRef.current;

        const { scrollHeight, clientHeight } = e.currentTarget;
        const atBottom = scrollHeight - scrollTop - clientHeight < NEAR_BOTTOM;

        if (hiddenRef.current && atBottom) {
          // Force-show when reaching the end of content
          hiddenRef.current = false;
          for (const t of targets) {
            t.ref.current?.classList.remove(t.hiddenClass);
          }
          anchorRef.current = scrollTop;
        } else if (!hiddenRef.current && delta > THRESHOLD_HIDE) {
          hiddenRef.current = true;
          for (const t of targets) {
            t.ref.current?.classList.add(t.hiddenClass);
          }
          anchorRef.current = scrollTop;
        } else if (hiddenRef.current && delta < -THRESHOLD_SHOW) {
          hiddenRef.current = false;
          for (const t of targets) {
            t.ref.current?.classList.remove(t.hiddenClass);
          }
          anchorRef.current = scrollTop;
        }

        // Drift anchor in current direction
        if (
          (hiddenRef.current && delta > 0) ||
          (!hiddenRef.current && delta < 0)
        ) {
          anchorRef.current = scrollTop;
        }
      }, THROTTLE_MS),
    [targets],
  );

  return { onScroll };
}
