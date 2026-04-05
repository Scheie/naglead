"use client";

import { WarningCircle } from "@phosphor-icons/react";

export function PhoneMockup() {
  return (
    <>
      {/* Decorative back plate */}
      <div className="absolute w-[320px] h-[640px] bg-nag-orange rotate-6 rounded-[3rem] top-4 right-8 lg:right-0 opacity-50 blur-lg" />

      {/* The Phone */}
      <div className="relative w-[320px] sm:w-[340px] h-[680px] bg-nag-zinc border-[12px] border-black rounded-[3rem] shadow-2xl overflow-hidden flex flex-col pt-8 pb-4">
        {/* Notch */}
        <div className="absolute top-0 w-full flex justify-center pb-2 z-20">
          <div className="w-32 h-6 bg-black rounded-b-3xl" />
        </div>

        {/* App Header */}
        <div className="px-6 pb-4 border-b border-zinc-800 flex justify-between items-end h-20">
          <div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
              Today&apos;s Leads
            </p>
            <h3 className="font-loud text-3xl headline mt-1">
              Pending <span className="text-nag-orange">(3)</span>
            </h3>
          </div>
          <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white pb-1 font-bold text-xl">
            +
          </button>
        </div>

        {/* Notifications */}
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto bg-black relative">
          {/* Gentle */}
          <div className="notify-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-nag-yellow" />
              <span className="text-xs font-bold text-nag-yellow uppercase">
                Waiting 2 hrs
              </span>
            </div>
            <h4 className="font-bold text-white mb-1">Steve (Leaky Sink)</h4>
            <p className="text-sm text-zinc-400 mb-3">123 Maple St.</p>
            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 rounded-md text-sm transition-colors border border-zinc-700">
              Call Now & Log
            </button>
          </div>

          {/* Medium */}
          <div className="notify-2 bg-zinc-900 border border-nag-orange/30 rounded-xl p-4 shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-nag-orange" />
                <span className="text-xs font-bold text-nag-orange uppercase">
                  Waiting 6 hrs
                </span>
              </div>
              <WarningCircle weight="fill" className="text-nag-orange" />
            </div>
            <h4 className="font-bold text-white mb-1">Quote: New Boiler</h4>
            <p className="text-sm text-zinc-400 mb-3">
              Requires callback today.
            </p>
            <button className="w-full bg-nag-orange/20 text-nag-orange hover:bg-nag-orange hover:text-black font-semibold py-2 rounded-md text-sm transition-colors border border-nag-orange/50">
              Call Now & Log
            </button>
          </div>

          {/* Urgent */}
          <div className="notify-3 bg-red-950 border-2 border-red-600 rounded-xl p-4 shadow-lg animate-urgent relative overflow-hidden mt-2">
            <div className="absolute top-2 right-2 w-16 h-16 bg-red-600/20 rounded-bl-full" />
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black text-red-500 uppercase tracking-widest">
                LOSING JOB SOON
              </span>
            </div>
            <h4 className="font-bold text-white text-lg mb-1 relative z-10">
              Sarah - Kitchen Remodel
            </h4>
            <p className="text-sm text-red-300 font-medium mb-3 relative z-10">
              It&apos;s been 24 HOURS. She is absolutely calling someone else
              right now.
            </p>
            <button className="w-full bg-red-600 text-white font-bold py-3 rounded-md text-sm hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)] relative z-10">
              CALL 555-0192 NOW
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-6 w-full bg-black flex justify-center items-center rounded-b-2xl">
          <div className="w-1/3 h-1 bg-zinc-600 rounded-full" />
        </div>
      </div>
    </>
  );
}
