"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Coins, Trash2, RotateCcw } from "lucide-react";
import { useChatStore } from "@/lib/store/chat-store";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import { createClient } from "@/lib/supabase/client";
import type { Character, ChatMessage } from "@/types";
import Link from "next/link";

interface ChatWindowProps {
  character: Character;
  initialMessages: ChatMessage[];
  initialCredits: number;
}

export function ChatWindow({
  character,
  initialMessages,
  initialCredits,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [clearing, setClearing] = useState(false);
  const {
    messages,
    isLoading,
    credits,
    setCharacter,
    setMessages,
    setCredits,
  } = useChatStore();

  // Initialize store
  useEffect(() => {
    setCharacter(character);
    setMessages(initialMessages);
    setCredits(initialCredits);
  }, [character, initialMessages, initialCredits]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Clear chat history
  const handleClearChat = async () => {
    if (!confirm("Hapus semua chat dengan " + character.name + "?")) return;
    
    setClearing(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from("messages")
          .delete()
          .eq("user_id", user.id)
          .eq("character_id", character.id);
      }
      
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    } finally {
      setClearing(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-nusa-bg">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-nusa-border bg-nusa-surface relative">
        <Link
          href="/characters"
          className="p-1 text-nusa-muted hover:text-nusa-text transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="w-9 h-9 rounded-full bg-nusa-primary/20 flex-shrink-0 overflow-hidden">
          {character.avatar_url ? (
            <img
              src={character.avatar_url}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-nusa-primary text-sm">
              {character.name[0]}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-sm font-medium text-nusa-text">
            {character.name}
          </h2>
          <p className="text-xs text-green-400">Online</p>
        </div>

        {/* Credits display */}
        <div className="flex items-center gap-1.5 bg-nusa-card px-3 py-1.5 rounded-full border border-nusa-border">
          <Coins size={14} className="text-yellow-400" />
          <span className="text-xs font-medium text-nusa-text">{credits}</span>
        </div>

        {/* Menu button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 text-nusa-muted hover:text-nusa-text transition-colors"
        >
          <RotateCcw size={18} />
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)} 
            />
            <div className="absolute right-4 top-14 z-20 bg-nusa-card border border-nusa-border rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={handleClearChat}
                disabled={clearing}
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-nusa-surface transition-colors w-full"
              >
                <Trash2 size={16} />
                {clearing ? "Menghapus..." : "Hapus Semua Chat"}
              </button>
            </div>
          </>
        )}
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Greeting */}
        {messages.length === 0 && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-9 h-9 rounded-full bg-nusa-primary/20 flex-shrink-0 flex items-center justify-center">
              <span className="text-sm text-nusa-primary">
                {character.name[0]}
              </span>
            </div>
            <div className="bg-nusa-card text-nusa-text border border-nusa-border rounded-2xl rounded-bl-md px-4 py-2.5 text-sm">
              <p className="text-xs text-nusa-primary font-medium mb-1">
                {character.name}
              </p>
              <p>{character.greeting}</p>
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            characterName={character.name}
            characterAvatar={character.avatar_url}
          />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-9 h-9 rounded-full bg-nusa-primary/20 flex-shrink-0 flex items-center justify-center">
              <span className="text-sm text-nusa-primary">
                {character.name[0]}
              </span>
            </div>
            <div className="bg-nusa-card border border-nusa-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-nusa-muted rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-nusa-muted rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-nusa-muted rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
