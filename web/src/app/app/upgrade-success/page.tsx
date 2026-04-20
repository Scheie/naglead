"use client";

import { Lightning, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

export default function UpgradeSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lightning weight="bold" className="text-white text-4xl" />
        </div>

        <h1 className="font-loud text-5xl headline text-white mb-3">
          YOU&apos;RE PRO!
        </h1>

        <p className="text-zinc-400 font-medium mb-8">
          Unlimited leads. Full nagging power. Go win some jobs.
        </p>

        <div className="space-y-3">
          {/* Deep link for mobile app - Expo handles naglead:// scheme */}
          <a
            href="naglead://upgrade-success"
            className="w-full bg-nag-orange text-black font-loud text-2xl headline py-4 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
          >
            OPEN APP
            <ArrowRight weight="bold" />
          </a>

          {/* Fallback for web users */}
          <Link
            href="/app"
            className="w-full block text-center bg-zinc-800 text-zinc-300 font-semibold py-3 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
          >
            Continue in browser
          </Link>
        </div>

        <p className="text-zinc-600 text-xs mt-6">
          Your subscription is active. You can manage it anytime in Settings.
        </p>
      </div>
    </div>
  );
}
