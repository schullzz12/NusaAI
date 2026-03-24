"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
  characterName?: string;
  characterAvatar?: string;
}

export function ChatBubble({
  message,
  characterName,
  characterAvatar,
}: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex gap-3 max-w-[85%]", isUser ? "ml-auto flex-row-reverse" : "")}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-nusa-primary/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
          {characterAvatar ? (
            <img
              src={characterAvatar}
              alt={characterName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm text-nusa-primary">
              {characterName?.[0] || "AI"}
            </span>
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-nusa-primary text-white rounded-br-md"
            : "bg-nusa-card text-nusa-text border border-nusa-border rounded-bl-md"
        )}
      >
        {!isUser && (
          <p className="text-xs text-nusa-primary font-medium mb-1">
            {characterName}
          </p>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Generated image */}
        {message.image_url && (
          <img
            src={message.image_url}
            alt="Generated"
            className="mt-2 rounded-lg max-w-full"
          />
        )}
      </div>
    </div>
  );
}
