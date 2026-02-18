import { useRef, useCallback, useEffect } from "react";

interface UseNativeDialogOptions {
  onClose?: () => void;
}

interface UseNativeDialogReturn {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  open: () => void;
  close: () => void;
  handleBackdropClick: (event: React.MouseEvent<HTMLDialogElement>) => void;
}

/**
 * Closes the dialog with a CSS exit animation (if one is defined via [data-closing]).
 * Checks animation state after rAF so CSS has been applied before deciding whether to wait.
 * Falls back to immediate close if no animation is defined for this dialog variant.
 */
function animatedClose(dialog: HTMLDialogElement, isClosingRef: React.MutableRefObject<boolean>) {
  if (isClosingRef.current) return;
  isClosingRef.current = true;

  dialog.dataset.closing = "true";

  requestAnimationFrame(() => {
    const style = getComputedStyle(dialog);
    const hasAnimation =
      style.animationName !== "none" && style.animationDuration !== "0s";

    if (!hasAnimation) {
      delete dialog.dataset.closing;
      isClosingRef.current = false;
      dialog.close();
      return;
    }

    dialog.addEventListener(
      "animationend",
      () => {
        delete dialog.dataset.closing;
        isClosingRef.current = false;
        dialog.close();
      },
      { once: true },
    );
  });
}

export function useNativeDialog({ onClose }: UseNativeDialogOptions = {}): UseNativeDialogReturn {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isClosingRef = useRef(false);

  const close = useCallback(() => {
    if (dialogRef.current) {
      animatedClose(dialogRef.current, isClosingRef);
    }
  }, []);

  const open = useCallback(() => {
    isClosingRef.current = false;
    dialogRef.current?.showModal();
  }, []);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === dialogRef.current) {
        close();
      }
    },
    [close],
  );

  // Intercept ESC key (fires 'cancel' before native close) to play exit animation
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      animatedClose(dialog, isClosingRef);
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, []);

  // onClose callback via native 'close' event (fires after .close() is called)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !onClose) return;

    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [onClose]);

  return { dialogRef, open, close, handleBackdropClick };
}
