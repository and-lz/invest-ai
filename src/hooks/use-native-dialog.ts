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

export function useNativeDialog({ onClose }: UseNativeDialogOptions = {}): UseNativeDialogReturn {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === dialogRef.current) {
        close();
      }
    },
    [close],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !onClose) return;

    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [onClose]);

  return { dialogRef, open, close, handleBackdropClick };
}
