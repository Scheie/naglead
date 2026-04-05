"use client";

import { BellRinging, CurrencyDollar } from "@phosphor-icons/react";

export function HowItWorks() {
  return (
    <section
      id="how"
      className="bg-nag-dark py-24 border-t-8 border-nag-orange z-20 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-loud text-6xl headline text-white text-center mb-20">
          HOW WE FIX IT IN 3 STEPS
        </h2>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-1 bg-zinc-800 z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-zinc-900 border-4 border-zinc-700 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <span className="font-loud text-6xl text-zinc-500 headline">
                01
              </span>
            </div>
            <h3 className="font-loud text-4xl headline text-white mb-3">
              Add Name & What They Need
            </h3>
            <p className="text-zinc-400 font-medium px-4">
              That&apos;s it. No email required. No phone needed. Takes 4
              seconds while sitting at a red light.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-nag-orange border-4 border-white rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,69,0,0.4)] transform hover:scale-105 transition-transform duration-300">
              <BellRinging weight="bold" className="text-5xl text-black" />
            </div>
            <h3 className="font-loud text-4xl headline text-white mb-3">
              We Nag You
            </h3>
            <p className="text-zinc-400 font-medium px-4">
              The app sends friendly-then-firm reminders to your phone until
              you follow up. It won&apos;t forget, even if you do.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-green-500 border-4 border-white rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
              <CurrencyDollar weight="bold" className="text-6xl text-black" />
            </div>
            <h3 className="font-loud text-4xl headline text-white mb-3">
              Win The Job
            </h3>
            <p className="text-zinc-400 font-medium px-4">
              Speed is everything. By calling back fastest, you win the quote
              before the competition even checks their voicemail.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
