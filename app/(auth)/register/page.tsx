"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!ageVerified) {
      setError("Kamu harus berusia 18+ untuk mendaftar");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || "User",
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Email ini sudah terdaftar. Coba login.");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-nusa-card border border-nusa-border rounded-2xl p-6 text-center space-y-3">
        <div className="text-4xl">🎉</div>
        <h2 className="text-lg font-semibold text-nusa-text">
          Pendaftaran Berhasil!
        </h2>
        <p className="text-sm text-nusa-muted">
          Cek email kamu untuk verifikasi akun. Setelah itu langsung bisa login
          dan dapat <span className="text-yellow-400 font-medium">50 kredit gratis</span>!
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 bg-nusa-primary hover:bg-nusa-primary-dark text-white font-medium rounded-xl px-6 py-2.5 text-sm transition-colors"
        >
          Ke Halaman Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="bg-nusa-card border border-nusa-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-nusa-text text-center">
          Buat Akun Baru
        </h2>

        {/* Free credits banner */}
        <div className="bg-nusa-primary/10 border border-nusa-primary/30 rounded-xl px-4 py-2.5 text-center">
          <p className="text-sm text-nusa-primary font-medium">
            🎁 Daftar sekarang, dapat 50 kredit gratis!
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Display Name */}
        <div>
          <label className="block text-xs text-nusa-muted mb-1.5">
            Nama Tampilan
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Nama kamu"
            className="w-full bg-nusa-bg border border-nusa-border rounded-xl px-4 py-2.5 text-sm text-nusa-text placeholder:text-nusa-muted focus:outline-none focus:border-nusa-primary"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs text-nusa-muted mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
            className="w-full bg-nusa-bg border border-nusa-border rounded-xl px-4 py-2.5 text-sm text-nusa-text placeholder:text-nusa-muted focus:outline-none focus:border-nusa-primary"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs text-nusa-muted mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
              className="w-full bg-nusa-bg border border-nusa-border rounded-xl px-4 py-2.5 pr-10 text-sm text-nusa-text placeholder:text-nusa-muted focus:outline-none focus:border-nusa-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-nusa-muted hover:text-nusa-text"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Age verification */}
        <button
          type="button"
          onClick={() => setAgeVerified(!ageVerified)}
          className="flex items-start gap-3 text-left w-full"
        >
          <div className="mt-0.5 flex-shrink-0">
            {ageVerified ? (
              <div className="w-5 h-5 bg-nusa-primary rounded flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 border-2 border-nusa-border rounded" />
            )}
          </div>
          <span className="text-xs text-nusa-muted leading-relaxed">
            Saya menyatakan bahwa saya berusia <span className="text-nusa-text font-medium">18 tahun ke atas</span> dan
            bersedia menerima konten dewasa.
          </span>
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !ageVerified}
          className="w-full bg-nusa-primary hover:bg-nusa-primary-dark text-white font-medium rounded-xl py-2.5 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Mendaftar..." : "Daftar Sekarang"}
        </button>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-nusa-muted">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-nusa-primary hover:underline font-medium"
        >
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
