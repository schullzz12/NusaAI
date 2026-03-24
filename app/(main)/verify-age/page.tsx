Set-Content "app/(main)/verify-age/page.tsx" -Encoding UTF8 -Value '"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VerifyAgePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({ is_verified_age: true })
        .eq("id", user.id);
    }

    router.push("/characters");
    router.refresh();
  };

  return (
    <div className="min-h-[100dvh] bg-nusa-bg flex items-center justify-center px-5">
      <div className="bg-nusa-card border border-nusa-border rounded-2xl p-8 max-w-sm w-full text-center space-y-6">
        <div className="text-5xl">🔞</div>
        <div>
          <h1 className="text-xl font-bold text-nusa-text mb-2">Verifikasi Usia</h1>
          <p className="text-sm text-nusa-muted">
            Platform ini hanya untuk pengguna berusia <strong className="text-nusa-text">18 tahun ke atas</strong>.
            Dengan melanjutkan, kamu menyatakan bahwa kamu sudah berusia 18+.
          </p>
        </div>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-nusa-primary hover:bg-nusa-primary-dark text-white font-medium rounded-xl py-3 text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Ya, saya berusia 18+"}
        </button>
        <p className="text-xs text-nusa-muted">
          Jika kamu belum 18 tahun, harap tinggalkan halaman ini.
        </p>
      </div>
    </div>
  );
}'