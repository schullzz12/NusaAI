import { create } from "zustand";
import type { ChatMessage, Character } from "@/types";

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  credits: number;
  character: Character | null;

  setCharacter: (character: Character) => void;
  setCredits: (credits: number) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;

  // Send message and get AI response
  sendMessage: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  credits: 0,
  character: null,

  setCharacter: (character) => set({ character }),
  setCredits: (credits) => set({ credits }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),

  sendMessage: async (content: string) => {
    const { character, credits } = get();
    if (!character || !content.trim()) return;

    if (credits < 1) {
      // Could show toast or redirect to topup
      return;
    }

    // Optimistic: add user message immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: "",
      character_id: character.id,
      role: "user",
      content,
      credits_used: 1,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character_id: character.id,
          message: content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Remove optimistic message on error
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== userMessage.id),
          isLoading: false,
        }));

        if (response.status === 402) {
          // Kredit habis - could trigger topup modal
          set({ credits: 0 });
        }

        throw new Error(data.error || "Gagal mengirim pesan");
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        user_id: "",
        character_id: character.id,
        role: "assistant",
        content: data.message,
        credits_used: 0,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        credits: data.credits_remaining,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
