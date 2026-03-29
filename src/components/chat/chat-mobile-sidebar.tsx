"use client";

import { forwardRef, useImperativeHandle, useCallback } from "react";
import { SidebarTabs } from "@/components/chat/sidebar-tabs";
import { useNativeDialog } from "@/hooks/use-native-dialog";
import { cn } from "@/lib/utils";
import { dialog } from "@/lib/design-system";

export interface ChatMobileSidebarHandle {
  open: () => void;
}

interface ChatMobileSidebarProps {
  readonly conversaAtualId: string | null;
  readonly onSelecionarConversa: (identificador: string) => void;
  readonly onNovaConversa: () => void;
}

export const ChatMobileSidebar = forwardRef<ChatMobileSidebarHandle, ChatMobileSidebarProps>(
  function ChatMobileSidebar({ conversaAtualId, onSelecionarConversa, onNovaConversa }, ref) {
    const {
      dialogRef,
      open,
      close,
      handleBackdropClick,
    } = useNativeDialog();

    useImperativeHandle(ref, () => ({ open }), [open]);

    const handleSelecionarConversa = useCallback(
      (identificador: string) => {
        close();
        onSelecionarConversa(identificador);
      },
      [close, onSelecionarConversa],
    );

    const handleNovaConversa = useCallback(() => {
      close();
      onNovaConversa();
    }, [close, onNovaConversa]);

    return (
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-label="Conversas"
        className={cn(
          "bg-background flex flex-col border-r p-0 shadow-lg md:hidden",
          dialog.backdrop,
          dialog.drawerLeft,
        )}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(320px, 80vw)",
          height: "100dvh",
          margin: 0,
        }}
      >
        <SidebarTabs
          conversaAtualId={conversaAtualId}
          onSelecionarConversa={handleSelecionarConversa}
          onNovaConversa={handleNovaConversa}
          fullscreen
        />
      </dialog>
    );
  },
);
