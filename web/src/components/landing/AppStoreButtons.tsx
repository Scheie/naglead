"use client";

import { AppleLogo, GooglePlayLogo } from "@phosphor-icons/react";

const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL;
const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL;

const appsLive = !!(APP_STORE_URL || PLAY_STORE_URL);

export function AppStoreButtons({ className = "" }: { className?: string }) {
  if (appsLive) {
    return (
      <div className={`flex gap-3 ${className}`}>
        {APP_STORE_URL && (
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-5 py-3 rounded-lg border-2 border-black shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <AppleLogo weight="fill" className="text-xl" />
            App Store
          </a>
        )}
        {PLAY_STORE_URL && (
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-5 py-3 rounded-lg border-2 border-black shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <GooglePlayLogo weight="fill" className="text-xl" />
            Google Play
          </a>
        )}
      </div>
    );
  }

  // Coming soon state
  return (
    <div className={`flex gap-3 ${className}`}>
      <div className="flex items-center gap-2 bg-zinc-800 text-zinc-500 font-semibold text-sm px-5 py-3 rounded-lg border-2 border-zinc-700">
        <AppleLogo weight="fill" className="text-xl" />
        iOS — Soon
      </div>
      <div className="flex items-center gap-2 bg-zinc-800 text-zinc-500 font-semibold text-sm px-5 py-3 rounded-lg border-2 border-zinc-700">
        <GooglePlayLogo weight="fill" className="text-xl" />
        Android — Soon
      </div>
    </div>
  );
}
