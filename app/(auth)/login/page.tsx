"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/characters";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          setError("Email atau password salah");
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="bg-nusa-card border border-nusa-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-nusa-text text-center">
          Masuk ke Akun
        </h2>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

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
              placeholder="••••••••"
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-nusa-primary hover:bg-nusa-primary-dark text-white font-medium rounded-xl py-2.5 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-nusa-muted">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="text-nusa-primary hover:underline font-medium"
        >
          Daftar gratis
        </Link>
      </p>
    </form>
  );
}
