"use client";

import { X } from "@phosphor-icons/react";
import Link from "next/link";

export default function UpgradeCancelledPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <X weight="bold" className="text-zinc-500 text-4xl" />
        </div>

        <h1 className="font-loud text-4xl headline text-white mb-3">
          NO WORRIES
        </h1>

        <p className="text-zinc-400 font-medium mb-8">
          You can upgrade anytime. The free plan still gives you 5 active leads
          and full nagging.
        </p>

        <div className="space-y-3">
          <a
            href="naglead://home"
            className="w-full bg-nag-orange text-black font-loud text-2xl headline py-4 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
          >
            BACK TO APP
          </a>

          <Link
            href="/app"
            className="w-full block text-center bg-zinc-800 text-zinc-300 font-semibold py-3 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
          >
            Continue in browser
          </Link>
        </div>
      </div>
    </div>
  );
}
