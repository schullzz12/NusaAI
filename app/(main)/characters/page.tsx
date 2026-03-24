import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CharactersPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: characters } = await supabase
    .from("characters")
    .select("id, name, persona, avatar_url, greeting")
    .eq("is_active", true);

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, display_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-[100dvh] bg-nusa-bg text-nusa-text">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <p className="text-sm text-nusa-muted">
          Hai, {profile?.display_name || "User"} 👋
        </p>
        <h1 className="text-xl font-bold mt-1">Pilih Teman Chat</h1>
        <div className="flex items-center gap-1.5 mt-2 text-sm text-nusa-muted">
          <span className="text-yellow-400">🪙</span>
          <span>{profile?.credits || 0} kredit tersisa</span>
        </div>
      </header>

      {/* Character cards */}
      <div className="px-5 pb-8 space-y-4">
        {characters?.map((char) => (
          <Link
            key={char.id}
            href={`/chat/${char.id}`}
            className="block bg-nusa-card border border-nusa-border rounded-2xl p-4 hover:border-nusa-primary/50 transition-colors active:scale-[0.98]"
          >
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-xl bg-nusa-primary/20 flex-shrink-0 overflow-hidden">
                {char.avatar_url ? (
                  <img
                    src={char.avatar_url}
                    alt={char.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-nusa-primary">
                    {char.name[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-nusa-text">{char.name}</h3>
                <p className="text-xs text-nusa-muted mt-0.5">{char.persona}</p>
                <p className="text-sm text-nusa-text/70 mt-2 line-clamp-2">
                  &ldquo;{char.greeting}&rdquo;
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom nav hint */}
      <div className="fixed bottom-0 left-0 right-0 bg-nusa-surface border-t border-nusa-border px-5 py-3 flex justify-around text-xs text-nusa-muted">
        <span className="text-nusa-primary font-medium">💬 Chat</span>
        <Link href="/topup" className="hover:text-nusa-text">💰 Top Up</Link>
        <Link href="/profile" className="hover:text-nusa-text">👤 Profil</Link>
      </div>
    </div>
  );
}
