"use client";

import {
  HandWaving,
  Warning,
  Siren,
  Skull,
} from "@phosphor-icons/react";

const nodes = [
  {
    time: "2 Hours Later",
    title: "The Friendly Nudge",
    message:
      '"Hey boss, reminder to follow up with John. Quote request came in a little while ago."',
    badgeBg: "bg-nag-yellow",
    badgeText: "text-black",
    dotBorder: "border-nag-yellow",
    cardBorder: "border-zinc-800",
    cardBg: "bg-zinc-900",
    textColor: "text-zinc-400",
    icon: HandWaving,
    iconColor: "text-zinc-400",
    side: "left" as const,
  },
  {
    time: "6 Hours Later",
    title: "Firm Direction",
    message:
      '"John is still waiting. Other guys are finishing their work days and might call him. Do it now."',
    badgeBg: "bg-orange-500",
    badgeText: "text-black",
    dotBorder: "border-orange-400",
    cardBorder: "border-orange-900/50",
    cardBg: "bg-zinc-900",
    textColor: "text-zinc-400",
    icon: Warning,
    iconColor: "text-orange-400",
    side: "right" as const,
  },
  {
    time: "24 Hours Later",
    title: "Warning Status",
    message:
      '"WARNING: If John had a leak, his house is flooded. If he wanted a quote, he got three already. CALL HIM."',
    badgeBg: "bg-nag-orange",
    badgeText: "text-black",
    dotBorder: "border-black",
    cardBorder: "border-nag-orange",
    cardBg: "bg-[#1a0b06]",
    textColor: "text-orange-200",
    icon: Siren,
    iconColor: "text-nag-orange",
    side: "left" as const,
    large: true,
  },
  {
    time: "48 Hours Later",
    title: "YOU ARE BURNING CASH",
    message:
      '"WAKE UP! You paid for marketing to get this lead and now you are ignoring it. Tap this notification and call John immediately."',
    badgeBg: "bg-red-600",
    badgeText: "text-white",
    dotBorder: "border-black",
    cardBorder: "border-red-600 border-[3px]",
    cardBg: "bg-red-950",
    textColor: "text-red-300",
    icon: Skull,
    iconColor: "text-black",
    side: "right" as const,
    final: true,
  },
];

export function EscalationTimeline() {
  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-loud text-6xl headline text-white mb-4">
            THE ESCALATION PROTOCOL
          </h2>
          <p className="text-xl text-zinc-500 font-medium">
            We start nice. We end mean. You get paid.
          </p>
        </div>

        <div className="relative mt-12 pb-12">
          {/* The gradient line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[4px] -ml-[2px] bg-gradient-to-b from-nag-yellow via-nag-orange to-red-600 rounded-full" />

          {nodes.map((node, i) => (
            <div
              key={i}
              className={`relative flex items-center justify-between md:justify-normal mb-16 last:mb-0 group ${
                node.side === "left" ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Dot */}
              <div
                className={`absolute left-8 md:left-1/2 ${
                  node.final
                    ? "w-10 h-10 -ml-5 rounded-md bg-red-600 border-[3px] rotate-45 shadow-[0_0_30px_rgba(220,38,38,1)] flex items-center justify-center"
                    : node.large
                      ? "w-8 h-8 -ml-4 rounded-full bg-nag-orange border-4 shadow-[0_0_20px_rgba(255,69,0,0.8)] animate-pulse"
                      : `w-6 h-6 -ml-3 rounded-full bg-black border-4 ${node.dotBorder} group-hover:scale-125 transition-transform duration-300`
                } z-10 ${node.dotBorder}`}
              >
                {node.final && (
                  <Skull
                    weight="bold"
                    className="text-black -rotate-45 text-xl"
                  />
                )}
              </div>

              {/* Card */}
              <div
                className={`pl-20 md:pl-0 ${
                  node.side === "left"
                    ? "md:w-1/2 md:pr-12 md:text-right"
                    : "md:w-1/2 md:pl-12"
                }`}
              >
                <div
                  className={`inline-block ${node.cardBg} border ${node.cardBorder} rounded-xl ${node.final ? "p-6 shadow-brutal-orange" : "p-5 shadow-lg"} w-full max-w-sm ${node.side === "left" ? "ml-auto text-left md:text-right" : "text-left"}`}
                >
                  <span
                    className={`${node.badgeBg} ${node.badgeText} font-bold text-xs px-2 py-1 rounded-sm uppercase tracking-wide mb-3 inline-block`}
                  >
                    {node.time}
                  </span>
                  <h4
                    className={`text-white font-bold ${node.final ? "font-loud text-3xl headline" : node.large ? "text-2xl" : "text-xl"} mb-2 flex items-center ${node.side === "left" ? "md:justify-end" : ""} gap-2`}
                  >
                    {node.title}
                    <node.icon weight={node.final ? "bold" : "fill"} className={node.iconColor} />
                  </h4>
                  <p
                    className={`${node.textColor} text-sm font-medium ${node.final ? "font-bold mb-4" : ""}`}
                  >
                    {node.message}
                  </p>
                  {node.final && (
                    <button className="w-full bg-red-600 text-white font-bold uppercase py-2 rounded shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                      I surrender, call John
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
