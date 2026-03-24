import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/chat/chat-window";

interface ChatPageProps {
  params: { characterId: string };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const supabase = createServerSupabase();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check age verification
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, is_verified_age")
    .eq("id", user.id)
    .single();

  if (!profile?.is_verified_age) {
    redirect("/verify-age");
  }

  // Load character
  const { data: character } = await supabase
    .from("characters")
    .select("id, name, persona, avatar_url, greeting, system_prompt")
    .eq("id", params.characterId)
    .eq("is_active", true)
    .single();

  if (!character) {
    redirect("/characters");
  }

  // Load chat history
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", user.id)
    .eq("character_id", params.characterId)
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <ChatWindow
      character={{
        ...character,
        // Don't send system_prompt to client
        system_prompt: "",
      }}
      initialMessages={messages || []}
      initialCredits={profile.credits}
    />
  );
}
