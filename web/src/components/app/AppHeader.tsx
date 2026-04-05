"use client";

import { Megaphone, Plus, GearSix } from "@phosphor-icons/react";
import Link from "next/link";

interface AppHeaderProps {
  userName: string;
  onAddLead: () => void;
}

export function AppHeader({ userName, onAddLead }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-nag-dark/95 backdrop-blur-md border-b-2 border-nag-orange">
      <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-nag-orange rounded-sm flex items-center justify-center">
            <Megaphone weight="bold" className="text-black text-lg" />
          </div>
          <div>
            <span className="font-loud text-xl headline text-white block leading-none mt-1 group-hover:text-nag-orange transition-colors">
              NAGLEAD
            </span>
            <span className="text-zinc-500 text-xs font-medium">
              Hey, {userName}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddLead}
            className="bg-nag-orange text-black font-loud text-lg headline px-4 py-2 rounded-sm shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1"
          >
            <Plus weight="bold" />
            ADD LEAD
          </button>
          <Link
            href="/app/settings"
            className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <GearSix weight="bold" />
          </Link>
        </div>
      </div>
    </header>
  );
}
