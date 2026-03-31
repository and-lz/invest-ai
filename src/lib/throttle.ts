/**
 * Creates a leading-edge throttled version of a function.
 * The function fires immediately on first call, then ignores
 * subsequent calls until `ms` milliseconds have elapsed.
 */
export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  ms: number,
): (...args: Args) => void {
  let last = 0;
  return (...args: Args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}
