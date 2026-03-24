"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, ImagePlus, Loader2 } from "lucide-react";
import { useChatStore } from "@/lib/store/chat-store";

export function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, credits } = useChatStore();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await sendMessage(message);
    } catch (err: any) {
      // Could show toast notification
      console.error(err.message);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  return (
    <div className="border-t border-nusa-border bg-nusa-surface p-3">
      {/* Credit warning */}
      {credits <= 5 && credits > 0 && (
        <div className="text-xs text-yellow-400 text-center mb-2">
          ⚠️ Sisa kredit kamu tinggal {credits}!{" "}
          <a href="/topup" className="text-nusa-primary underline">
            Top up sekarang
          </a>
        </div>
      )}

      {credits === 0 && (
        <div className="text-xs text-red-400 text-center mb-2">
          ❌ Kredit habis!{" "}
          <a href="/topup" className="text-nusa-primary underline font-medium">
            Top up dulu yuk
          </a>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Image generation button */}
        <button
          className="p-2 text-nusa-muted hover:text-nusa-primary transition-colors"
          title="Generate gambar (5 kredit)"
          disabled={isLoading || credits < 5}
        >
          <ImagePlus size={20} />
        </button>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={
            credits === 0
              ? "Top up kredit dulu ya..."
              : "Ketik pesan..."
          }
          disabled={isLoading || credits === 0}
          rows={1}
          className="flex-1 resize-none bg-nusa-card text-nusa-text text-sm rounded-xl px-4 py-2.5 border border-nusa-border focus:outline-none focus:border-nusa-primary placeholder:text-nusa-muted disabled:opacity-50"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || credits === 0}
          className="p-2.5 bg-nusa-primary text-white rounded-xl hover:bg-nusa-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
