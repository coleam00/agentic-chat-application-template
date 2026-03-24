"use client";

import { Send } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_CHARS = 4000;
const WARN_CHARS = 3800;

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount > WARN_CHARS;

  const charCountClass = isOverLimit
    ? "text-red-500"
    : isNearLimit
      ? "text-amber-500"
      : "text-muted-foreground/50";

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isOverLimit) {
      return;
    }
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, isOverLimit, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="border-t border-border/50 bg-background/80 p-4 backdrop-blur-sm">
      <div className="chat-input-glow mx-auto flex max-w-3xl items-end gap-2 rounded-xl bg-muted/50 p-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="max-h-32 min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim() || isOverLimit}
          size="icon"
          className="send-button-glow shrink-0"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </div>
      <div className="mx-auto mt-1.5 flex max-w-3xl items-center justify-between">
        <p className="text-muted-foreground/50 text-xs">Enter to send · Shift+Enter for new line</p>
        <p className={`text-xs ${charCountClass}`} aria-live="polite" aria-label="Character count">
          {charCount} / {MAX_CHARS}
        </p>
      </div>
    </div>
  );
}
