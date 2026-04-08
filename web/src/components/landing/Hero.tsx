"use client";

import { ArrowRight, PlayCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { PhoneMockup } from "./PhoneMockup";
import { AppStoreButtons } from "./AppStoreButtons";

export function Hero() {
  return (
    <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-hazard-subtle opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Copy */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="inline-flex items-center gap-3 bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-full w-max">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nag-orange opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-nag-orange" />
              </span>
              <span className="text-sm font-semibold tracking-wide text-zinc-300">
                NOT A CRM. JUST A REMINDER.
              </span>
            </div>

            <h1 className="font-loud text-7xl sm:text-8xl lg:text-[7rem] headline text-white drop-shadow-lg">
              STOP LOSING LEADS.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nag-orange to-nag-yellow inline-block mt-2">
                START GETTING NAGGED.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-zinc-400 font-medium max-w-2xl leading-relaxed">
              You track leads on torn receipts and the back of your hand. We
              know. NagLead is a {process.env.NEXT_PUBLIC_PAYMENTS_LIVE === "true" ? "$10/month " : "free, "}brute-force alert system that
              won&apos;t stop bothering you until you call that customer back.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mt-4">
              <Link
                href="/signup"
                className="bg-nag-orange text-black font-loud text-3xl headline px-8 py-4 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3"
              >
                TRY FREE FOR 5 LEADS
                <ArrowRight weight="bold" />
              </Link>
              <a
                href="#how"
                className="bg-transparent border-4 border-zinc-700 text-white font-loud text-3xl headline px-8 py-4 rounded-sm hover:border-white hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
              >
                <PlayCircle weight="bold" />
                SEE HOW IT WORKS
              </a>
            </div>

            <AppStoreButtons className="mt-2" />

            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500 font-semibold">
              <p>Built for tradespeople who are too busy to use a CRM.</p>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </header>
  );
}
