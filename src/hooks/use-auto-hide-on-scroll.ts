import { useRef, useCallback } from "react";

const THRESHOLD_HIDE = 50;
const THRESHOLD_SHOW = 25;

/**
 * Auto-hides an element based on scroll direction.
 * Uses direct DOM class toggling (no React state) to avoid re-renders.
 * Pair with a CSS transform-based hide (not layout-affecting) to prevent jitter.
 */
export function useAutoHideOnScroll(hiddenClass: string) {
  const targetRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef(0);
  const hiddenRef = useRef(false);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const delta = scrollTop - anchorRef.current;

      if (!hiddenRef.current && delta > THRESHOLD_HIDE) {
        hiddenRef.current = true;
        targetRef.current?.classList.add(hiddenClass);
        anchorRef.current = scrollTop;
      } else if (hiddenRef.current && delta < -THRESHOLD_SHOW) {
        hiddenRef.current = false;
        targetRef.current?.classList.remove(hiddenClass);
        anchorRef.current = scrollTop;
      }

      // Drift anchor in current direction
      if (
        (hiddenRef.current && delta > 0) ||
        (!hiddenRef.current && delta < 0)
      ) {
        anchorRef.current = scrollTop;
      }
    },
    [hiddenClass],
  );

  return { ref: targetRef, onScroll };
}
