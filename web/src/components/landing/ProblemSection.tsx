"use client";

import { NotePencil, Brain, Paperclip } from "@phosphor-icons/react";

const problems = [
  {
    icon: NotePencil,
    title: "The Dashboard Trap",
    description:
      "Most lead software wants you to fill out 14 fields just to save a name. You don't have time for pipelines.",
    bg: "bg-white",
    iconBg: "bg-red-100 border-red-500",
    iconColor: "text-red-600",
    rotate: "-rotate-2 hover:rotate-0",
  },
  {
    icon: Brain,
    title: "The Brain Leak",
    description:
      '"I\'ll remember to call Bob back on Tuesday." Spoiler: You will not remember Bob. Bob hired someone else.',
    bg: "bg-[#FFF9C4]",
    iconBg: "bg-yellow-100 border-yellow-500",
    iconColor: "text-yellow-600",
    rotate: "translate-y-4 hover:translate-y-2",
  },
  {
    icon: Paperclip,
    title: "The Paper Trail",
    description:
      "Tracking $5,000 jobs on greasy receipts on your dashboard is not a system. It's a gamble.",
    bg: "bg-white",
    iconBg: "bg-zinc-200 border-zinc-500",
    iconColor: "text-zinc-600",
    rotate: "rotate-1 hover:rotate-0",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-nag-concrete text-black py-24 torn-edge relative -mt-8 pt-32 pb-32 z-10 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 bg-dot-grid" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-loud text-6xl md:text-7xl headline mb-6">
            YOU RUN A TRADE,{" "}
            <br />
            <span className="text-red-600">NOT AN ADMIN ASSISTANT.</span>
          </h2>
          <p className="text-xl text-zinc-700 font-medium leading-relaxed">
            CRMs are built for people who sit at desks. You are under a sink or
            on a roof. Every time you say &ldquo;I&apos;ll call them when I get to the
            truck&rdquo;, you lose money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className={`${problem.bg} border-4 border-black p-6 shadow-brutal transform ${problem.rotate} transition-transform`}
            >
              <div
                className={`w-12 h-12 ${problem.iconBg} rounded-full flex items-center justify-center mb-4 border-2`}
              >
                <problem.icon
                  weight="bold"
                  className={`${problem.iconColor} text-2xl`}
                />
              </div>
              <h3 className="font-loud text-3xl headline mb-2">
                {problem.title}
              </h3>
              <p className="text-zinc-600 font-medium text-sm leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
