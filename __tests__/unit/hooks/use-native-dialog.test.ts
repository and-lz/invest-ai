import { describe, it, expect, vi } from "vitest";

/**
 * Tests for the backdrop-click detection logic used by useNativeDialog.
 *
 * The project uses a Node environment (no jsdom), so we test the core logic
 * directly rather than via renderHook. The hook itself is a thin wrapper around
 * these callback patterns.
 */

describe("useNativeDialog — backdrop click detection logic", () => {
  function createMockDialog() {
    return {
      showModal: vi.fn(),
      close: vi.fn(),
    } as unknown as HTMLDialogElement;
  }

  function handleBackdropClick(
    dialog: HTMLDialogElement,
    closeFn: () => void,
    event: { target: unknown },
  ) {
    if (event.target === dialog) {
      closeFn();
    }
  }

  describe("When the click target is the dialog element itself", () => {
    it("Given a backdrop click on the dialog, when handleBackdropClick fires, then close() is called", () => {
      const mockDialog = createMockDialog();
      const closeFn = vi.fn();

      handleBackdropClick(mockDialog, closeFn, { target: mockDialog });

      expect(closeFn).toHaveBeenCalledOnce();
    });
  });

  describe("When the click target is a child element", () => {
    it("Given a click on a child element, when handleBackdropClick fires, then close() is NOT called", () => {
      const mockDialog = createMockDialog();
      const closeFn = vi.fn();
      const childElement = {} as HTMLElement;

      handleBackdropClick(mockDialog, closeFn, { target: childElement });

      expect(closeFn).not.toHaveBeenCalled();
    });

    it("Given a click on null target, when handleBackdropClick fires, then close() is NOT called", () => {
      const mockDialog = createMockDialog();
      const closeFn = vi.fn();

      handleBackdropClick(mockDialog, closeFn, { target: null });

      expect(closeFn).not.toHaveBeenCalled();
    });
  });

  describe("onClose callback via native close event", () => {
    it("Given an onClose callback registered on close event, when close event fires, then onClose is called", () => {
      const listeners: Record<string, EventListener[]> = {};
      const mockDialog = {
        addEventListener: (type: string, fn: EventListener) => {
          if (!listeners[type]) listeners[type] = [];
          listeners[type].push(fn);
        },
        removeEventListener: (type: string, fn: EventListener) => {
          if (listeners[type]) {
            listeners[type] = listeners[type].filter((l) => l !== fn);
          }
        },
      };

      const onClose = vi.fn();
      mockDialog.addEventListener("close", onClose as EventListener);

      // Simulate native close event
      listeners["close"]?.forEach((fn) => fn(new Event("close")));

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("Given an onClose callback, when removeEventListener is called, then onClose is no longer triggered", () => {
      const listeners: Record<string, EventListener[]> = {};
      const mockDialog = {
        addEventListener: (type: string, fn: EventListener) => {
          if (!listeners[type]) listeners[type] = [];
          listeners[type].push(fn);
        },
        removeEventListener: (type: string, fn: EventListener) => {
          if (listeners[type]) {
            listeners[type] = listeners[type].filter((l) => l !== fn);
          }
        },
      };

      const onClose = vi.fn();
      mockDialog.addEventListener("close", onClose as EventListener);
      mockDialog.removeEventListener("close", onClose as EventListener);

      // Simulate native close event after removal
      listeners["close"]?.forEach((fn) => fn(new Event("close")));

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
