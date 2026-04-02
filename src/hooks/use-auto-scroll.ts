import { useRef, useState, useCallback, useEffect } from "react";

const NEAR_BOTTOM_THRESHOLD = 100;

interface UseAutoScrollOptions {
  readonly messageCount: number;
  readonly scrollAreaRef?: React.RefObject<HTMLDivElement | null>;
}

export function useAutoScroll({ messageCount, scrollAreaRef }: UseAutoScrollOptions) {
  const internalRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const prevMsgCountRef = useRef(messageCount);

  const mergedScrollRef = useCallback((node: HTMLDivElement | null) => {
    (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (scrollAreaRef) {
      (scrollAreaRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [scrollAreaRef]);

  const scrollToBottom = useCallback(() => {
    if (internalRef.current) {
      internalRef.current.scrollTo({ top: internalRef.current.scrollHeight, behavior: "smooth" });
    }
    setHasNewMessages(false);
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD;
    isNearBottomRef.current = nearBottom;
    setShowScrollBtn(!nearBottom);
    if (nearBottom) setHasNewMessages(false);
  }, []);

  // Smart auto-scroll: only scroll when user is near bottom and there are messages
  useEffect(() => {
    const newCount = messageCount;
    const hadNewMessages = newCount > prevMsgCountRef.current;
    prevMsgCountRef.current = newCount;

    if (newCount === 0 || !internalRef.current) return;

    if (isNearBottomRef.current) {
      internalRef.current.scrollTop = internalRef.current.scrollHeight;
    } else if (hadNewMessages) {
      setHasNewMessages(true);
    }
  }, [messageCount]);

  return { mergedScrollRef, showScrollBtn, hasNewMessages, scrollToBottom, handleScroll };
}
