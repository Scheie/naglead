"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Megaphone, ArrowRight } from "@phosphor-icons/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/app");
    }
  }

  return (
    <div className="min-h-screen bg-nag-dark flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-12 group">
        <div className="w-10 h-10 bg-nag-orange rounded-sm flex items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-transform">
          <Megaphone weight="bold" className="text-black text-2xl" />
        </div>
        <span className="font-loud text-4xl tracking-wide headline mt-1 text-white">
          NagLead<span className="text-nag-orange">.</span>
        </span>
      </Link>

      <div className="w-full max-w-sm bg-nag-zinc border-4 border-zinc-800 rounded-lg p-8">
        <h1 className="font-loud text-4xl headline text-white mb-2">LOG IN</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Your leads are waiting. Get back to nagging.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
              placeholder="Your password"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-medium bg-red-950 border border-red-800 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nag-orange text-black font-loud text-2xl headline py-3 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "LOGGING IN..." : "LOG IN"}
            <ArrowRight weight="bold" />
          </button>
        </form>

        <p className="text-zinc-500 text-sm text-center mt-6">
          No account?{" "}
          <Link
            href="/signup"
            className="text-nag-orange font-semibold hover:underline"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
