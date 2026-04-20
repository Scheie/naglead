"use client";

import { useState } from "react";
import { X, Lightning } from "@phosphor-icons/react";

interface UpgradePromptProps {
  activeCount: number;
  limit: number;
  onClose: () => void;
}

export function UpgradePrompt({ activeCount, limit, onClose }: UpgradePromptProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(plan: "pro" | "pro_annual") {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 400 && data?.error?.includes("already")) {
          onClose();
        }
        setLoading(null);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="upgrade-title" className="relative w-full max-w-sm bg-nag-zinc border-t-4 sm:border-4 border-nag-orange rounded-t-2xl sm:rounded-2xl p-8 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X weight="bold" />
        </button>

        <div className="w-16 h-16 bg-nag-orange rounded-full flex items-center justify-center mx-auto mb-6">
          <Lightning weight="bold" className="text-black text-3xl" />
        </div>

        <h2 id="upgrade-title" className="font-loud text-4xl headline text-white mb-3">
          YOU NEED MORE LEADS
        </h2>

        <p className="text-zinc-400 font-medium mb-2">
          You have <span className="text-white font-bold">{activeCount}</span> of{" "}
          <span className="text-white font-bold">{limit}</span> free active leads.
        </p>

        <p className="text-zinc-500 text-sm mb-8">
          Upgrade to Pro for unlimited leads, auto-add leads via email
          and phone, and more.
        </p>

        {process.env.NEXT_PUBLIC_PAYMENTS_LIVE === "true" ? (
          <div className="space-y-3">
            <button
              onClick={() => handleUpgrade("pro")}
              disabled={loading !== null}
              className="w-full bg-nag-orange text-black font-loud text-2xl headline py-4 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
            >
              {loading === "pro" ? "REDIRECTING..." : "UPGRADE TO PRO: $10/MO"}
            </button>
            <button
              onClick={() => handleUpgrade("pro_annual")}
              disabled={loading !== null}
              className="w-full bg-zinc-800 text-zinc-300 font-semibold py-3 rounded-lg hover:bg-zinc-700 transition-colors text-sm disabled:opacity-50"
            >
              {loading === "pro_annual" ? "Redirecting..." : "Go Annual: $89/yr (save $31)"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-nag-orange font-semibold">
              Pro plans coming soon.
            </p>
            <p className="text-zinc-500 text-sm">
              Mark some leads as won or lost to free up slots.
            </p>
          </div>
        )}

        <p className="text-zinc-600 text-xs mt-6">
          One saved job pays for 5 years of NagLead. Think about it.
        </p>
      </div>
    </div>
  );
}
