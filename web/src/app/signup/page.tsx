"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { guessCountryFromTimezone } from "@/lib/country-codes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Megaphone, ArrowRight } from "@phosphor-icons/react";

const trades = [
  "Plumber",
  "Electrician",
  "Cleaner",
  "Landscaper",
  "Painter",
  "Handyman",
  "Photographer",
  "Consultant",
  "Other",
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [trade, setTrade] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (emailDomain === "naglead.com" || emailDomain === "leads.naglead.com") {
      setError("You cannot register with a naglead.com email address.");
      setLoading(false);
      return;
    }

    let timezone = "America/New_York";
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch {}
    const country = guessCountryFromTimezone();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, trade, timezone, country },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setStep(4);
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
        {/* Progress dots */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-nag-orange" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) setStep(2);
            }}
          >
            <h1 className="font-loud text-4xl headline text-white mb-2">
              WHAT&apos;S YOUR NAME?
            </h1>
            <p className="text-zinc-400 text-sm mb-8">
              Keep it simple. First name is fine.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium text-lg focus:border-nag-orange focus:outline-none transition-colors mb-4"
              placeholder="Your name"
              autoFocus
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-nag-orange text-black font-loud text-2xl headline py-3 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              NEXT
              <ArrowRight weight="bold" />
            </button>
          </form>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-loud text-4xl headline text-white mb-2">
              WHAT&apos;S YOUR TRADE?
            </h1>
            <p className="text-zinc-400 text-sm mb-6">
              Pick the closest match.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {trades.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTrade(t);
                    setStep(3);
                  }}
                  className={`px-3 py-3 rounded border-2 font-semibold text-sm transition-all ${
                    trade === t
                      ? "bg-nag-orange text-black border-nag-orange"
                      : "bg-black text-zinc-300 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSignup}>
            <h1 className="font-loud text-4xl headline text-white mb-2">
              CREATE ACCOUNT
            </h1>
            <p className="text-zinc-400 text-sm mb-6">
              Last step, {name}. Under 10 seconds.
            </p>

            <div className="flex flex-col gap-4">
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
                  autoFocus
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
                  placeholder="6+ characters"
                  required
                  minLength={6}
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
                {loading ? "CREATING..." : "START GETTING NAGGED"}
                <ArrowRight weight="bold" />
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="text-center">
            <div className="text-6xl mb-6">📬</div>
            <h1 className="font-loud text-4xl headline text-white mb-3">
              CHECK YOUR EMAIL
            </h1>
            <p className="text-zinc-400 font-medium text-lg mb-2">
              We sent a confirmation link to <span className="text-white">{email}</span>
            </p>
            <p className="text-zinc-500 text-sm mb-8">
              Click the link to activate your account, then come back and log in.
            </p>
            <Link
              href="/login"
              className="bg-nag-orange text-black font-loud text-2xl headline px-8 py-3 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all inline-block"
            >
              GO TO LOGIN
            </Link>
          </div>
        )}

        {step > 1 && step < 3 && (
          <button
            onClick={() => setStep(step - 1)}
            className="text-zinc-500 text-sm font-medium mt-4 hover:text-white transition-colors"
          >
            &larr; Back
          </button>
        )}

        {step < 4 && (
          <p className="text-zinc-500 text-sm text-center mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-nag-orange font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
