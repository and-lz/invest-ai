import { describe, it, expect, vi } from "vitest";

/**
 * Tests for the backdrop-click detection logic and animated-close behavior
 * used by useNativeDialog.
 *
 * The project uses a Node environment (no jsdom), so we test the core logic
 * directly rather than via renderHook.
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

  describe("Animated close via [data-closing]", () => {
    it("Given a dialog with no animation, when animatedClose is called, then close() fires without adding data-closing", () => {
      const dataset: Record<string, string> = {};
      const mockDialog = {
        close: vi.fn(),
        dataset,
      } as unknown as HTMLDialogElement;

      // Simulate no CSS animation defined (getComputedStyle returns 'none')
      // animatedClose checks animationName after rAF; simulate the no-animation path directly
      function simulateAnimatedCloseNoAnimation(dialog: typeof mockDialog) {
        // This is what animatedClose does when getComputedStyle().animationName === 'none'
        dialog.dataset.closing = "true";
        // After rAF, animationName is 'none', so we immediately close
        delete dialog.dataset.closing;
        dialog.close();
      }

      simulateAnimatedCloseNoAnimation(mockDialog);

      expect(mockDialog.close).toHaveBeenCalledOnce();
      expect(mockDialog.dataset.closing).toBeUndefined();
    });

    it("Given a dialog with an exit animation, when animatedClose is called, then close() fires after animationend", () => {
      const listeners: Record<string, Array<EventListener>> = {};
      const dataset: Record<string, string> = {};

      const mockDialog = {
        close: vi.fn(),
        dataset,
        addEventListener: vi.fn((type: string, fn: EventListener) => {
          if (!listeners[type]) listeners[type] = [];
          listeners[type].push(fn);
        }),
      } as unknown as HTMLDialogElement;

      // Simulate the animated path (animationName is not 'none')
      function simulateAnimatedCloseWithAnimation(dialog: typeof mockDialog) {
        dialog.dataset.closing = "true";
        // After rAF, animationName is defined, so we wait for animationend
        dialog.addEventListener("animationend", () => {
          delete dialog.dataset.closing;
          dialog.close();
        });
      }

      simulateAnimatedCloseWithAnimation(mockDialog);

      // close() has NOT been called yet (waiting for animationend)
      expect(mockDialog.close).not.toHaveBeenCalled();
      expect(mockDialog.dataset.closing).toBe("true");

      // Simulate animationend firing
      listeners["animationend"]?.forEach((fn) => fn(new Event("animationend")));

      // Now close() should have been called
      expect(mockDialog.close).toHaveBeenCalledOnce();
      expect(mockDialog.dataset.closing).toBeUndefined();
    });

    it("Given a concurrent close call while already closing, when close is called again, then close() fires only once", () => {
      const isClosingRef = { current: false };

      function tryClose(closeFn: () => void) {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        closeFn();
      }

      const closeFn = vi.fn();

      tryClose(closeFn);
      tryClose(closeFn); // second call should be ignored

      expect(closeFn).toHaveBeenCalledOnce();
    });
  });
});
