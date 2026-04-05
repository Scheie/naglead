"use client";

import { Star } from "@phosphor-icons/react";

const testimonials = [
  {
    quote:
      "I hated this app for the first 3 days because it wouldn't shut up. Then I realized it secured me a $4k rewiring job I 100% would have forgotten about. Best 10 bucks I spend a month.",
    name: "Mike T.",
    trade: "Independent Electrician",
    cardBg: "bg-black text-white",
    cardShape: "rounded-tl-3xl rounded-br-3xl",
    starColor: "text-nag-yellow",
    tradeColor: "text-nag-orange",
  },
  {
    quote:
      "CRMs make my brain hurt. With NagLead, I just type a name and what they need, and it yells at me until the job is done. So simple even I can use it.",
    name: "Sam R.",
    trade: "Plumbing Contractor",
    cardBg: "bg-white text-black ring-4 ring-black",
    cardShape: "rounded-tr-3xl rounded-bl-3xl",
    starColor: "text-nag-orange",
    tradeColor: "text-zinc-500",
  },
  {
    quote:
      "I used to lose 2-3 leads a week because I was too busy on site to follow up. Now my phone nags me and I actually call people back. Revenue is up 30%.",
    name: "Alex K.",
    trade: "Residential Cleaning",
    cardBg: "bg-black text-white",
    cardShape: "rounded-tl-3xl rounded-br-3xl",
    starColor: "text-nag-yellow",
    tradeColor: "text-nag-orange",
    hideMd: true,
  },
];

export function Testimonials() {
  return (
    <section className="bg-nag-orange py-24 border-y-8 border-black z-10 relative overflow-hidden">
      <div className="absolute -right-[10%] top-[20%] w-[50%] h-8 bg-black opacity-20 rotate-[15deg]" />
      <div className="absolute -left-[5%] bottom-[20%] w-[30%] h-12 bg-black opacity-20 -rotate-[10deg]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <h2 className="font-loud text-5xl md:text-6xl headline text-black text-center mb-16">
          WHAT PEOPLE SAY
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className={`${t.cardBg} p-8 ${t.cardShape} shadow-brutal flex flex-col ${t.hideMd ? "md:hidden lg:flex" : ""}`}
            >
              <div className={`flex ${t.starColor} mb-4`}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} weight="fill" className="text-xl" />
                ))}
              </div>
              <p
                className={`${t.cardBg.includes("white") ? "text-zinc-700" : "text-zinc-300"} font-medium italic flex-1 mb-6`}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-600 border-2 border-nag-orange" />
                <div>
                  <h4 className="font-loud text-2xl headline">{t.name}</h4>
                  <p
                    className={`text-xs ${t.tradeColor} font-bold uppercase`}
                  >
                    {t.trade}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
