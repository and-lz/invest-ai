import { useRef, useMemo } from "react";
import { throttle } from "@/lib/throttle";

const THRESHOLD_HIDE = 50;
const THRESHOLD_SHOW = 25;
const THROTTLE_MS = 16; // ~1 animation frame

export interface AutoHideTarget {
  ref: React.RefObject<HTMLElement | null>;
  hiddenClass: string;
  /** When true, sets negative margin-bottom equal to element height to collapse space. */
  collapseSpace?: boolean;
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

        if (!hiddenRef.current && delta > THRESHOLD_HIDE) {
          hiddenRef.current = true;
          for (const t of targets) {
            const el = t.ref.current;
            if (!el) continue;
            if (t.collapseSpace) {
              el.style.marginBottom = `-${el.offsetHeight}px`;
            }
            el.classList.add(t.hiddenClass);
          }
          anchorRef.current = scrollTop;
        } else if (hiddenRef.current && delta < -THRESHOLD_SHOW) {
          hiddenRef.current = false;
          for (const t of targets) {
            const el = t.ref.current;
            if (!el) continue;
            if (t.collapseSpace) {
              el.style.marginBottom = "";
            }
            el.classList.remove(t.hiddenClass);
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
