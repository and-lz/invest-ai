import Image from "next/image";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { cn } from "@/lib/utils";
import type { ChatSuggestion } from "@/lib/chat-suggestions";

interface ChatEmptyStateProps {
  readonly fullscreen: boolean;
  readonly welcomeMessage?: string;
  readonly suggestions: readonly ChatSuggestion[];
  readonly onSuggestionSelect: (text: string) => void;
}

export function ChatEmptyState({ fullscreen: fs, welcomeMessage, suggestions, onSuggestionSelect }: ChatEmptyStateProps) {
  return (
    <div className={cn(
      "flex h-full flex-col items-center justify-center text-center",
      fs ? "mx-auto max-w-4xl gap-6" : "gap-4",
    )}>
      <Image src="/fortuna-minimal.png" alt="Fortuna" width={64} height={64} className={cn(fs ? "h-16 w-16" : "h-12 w-12")} />
      <div>
        <p className={cn("font-medium", fs ? "text-lg" : "text-sm")}>
          {welcomeMessage ?? "Ola! Sou a Fortuna, sua assistente de investimentos."}
        </p>
        <p className={cn("text-muted-foreground mt-1", fs ? "text-sm" : "text-xs")}>
          Pergunte sobre seus investimentos, e eu te ajudo a entender.
        </p>
      </div>
      <SuggestionChips
        suggestions={suggestions}
        onSelect={onSuggestionSelect}
        variant="empty-state"
        fullscreen={fs}
      />
    </div>
  );
}
