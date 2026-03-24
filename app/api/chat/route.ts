import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import { chatCompletion } from "@/lib/runpod";
import { deductCredits } from "@/lib/credits";
import type { ChatRequest, ChatResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Kamu harus login dulu" },
        { status: 401 }
      );
    }

    // 2. Parse request
    const { character_id, message }: ChatRequest = await request.json();

    if (!character_id || !message?.trim()) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Pesan terlalu panjang (maks 2000 karakter)" },
        { status: 400 }
      );
    }

    // 3. Get character data (with system_prompt)
    const adminSupabase = createAdminSupabase();
    const { data: character, error: charError } = await adminSupabase
      .from("characters")
      .select("*")
      .eq("id", character_id)
      .eq("is_active", true)
      .single();

    if (charError || !character) {
      return NextResponse.json(
        { error: "Karakter tidak ditemukan" },
        { status: 404 }
      );
    }

    // 4. Deduct credits BEFORE calling AI
    let creditsRemaining: number;
    try {
      creditsRemaining = await deductCredits(user.id, "CHAT_MESSAGE");
    } catch (err: any) {
      if (err.message === "INSUFFICIENT_CREDITS") {
        return NextResponse.json(
          {
            error: "Kredit kamu habis! Top up dulu yuk 💰",
            credits_remaining: 0,
          },
          { status: 402 }
        );
      }
      throw err;
    }

    // 5. Load chat history for context
    const { data: history } = await adminSupabase
      .from("messages")
      .select("role, content")
      .eq("user_id", user.id)
      .eq("character_id", character_id)
      .order("created_at", { ascending: true })
      .limit(30); // Last 30 messages for context

    const chatHistory = (history || []).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // 6. Call Qwen 2.5 72B via RunPod
    const aiResponse = await chatCompletion({
      systemPrompt: character.system_prompt,
      chatHistory,
      userMessage: message,
    });

    // 7. Save both messages to database
    const messagesToInsert = [
      {
        user_id: user.id,
        character_id,
        role: "user",
        content: message,
        credits_used: 1,
      },
      {
        user_id: user.id,
        character_id,
        role: "assistant",
        content: aiResponse,
        credits_used: 0,
      },
    ];

    await adminSupabase.from("messages").insert(messagesToInsert);

    // 8. Return response
    const response: ChatResponse = {
      message: aiResponse,
      credits_remaining: creditsRemaining,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Waduh, ada error nih. Coba lagi ya!" },
      { status: 500 }
    );
  }
}
