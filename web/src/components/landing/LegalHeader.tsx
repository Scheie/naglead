"use client";

import { Megaphone } from "@phosphor-icons/react";
import Link from "next/link";

export function LegalHeader() {
  return (
    <header className="border-b border-zinc-800 py-6">
      <div className="max-w-3xl mx-auto px-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-nag-orange rounded-sm flex items-center justify-center">
            <Megaphone weight="bold" className="text-black text-lg" />
          </div>
          <span className="font-loud text-2xl headline mt-1">
            NagLead<span className="text-nag-orange">.</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
