"use client";

import { useState } from "react";
import { Check, X } from "@phosphor-icons/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const PAYMENTS_LIVE = process.env.NEXT_PUBLIC_PAYMENTS_LIVE === "true";

const tiers = [
  {
    name: "TRY IT OUT",
    price: "$0",
    period: "",
    description:
      "Good for testing the waters. Limits you, but proves the concept.",
    features: [
      { text: "Up to 5 Active Leads", included: true },
      { text: "Standard Nagging", included: true },
      { text: "No Auto-Add Leads", included: false },
    ],
    cta: "START FREE",
    highlighted: false,
    paid: false,
  },
  {
    name: "PRO NAG",
    price: "$10",
    period: "/ month",
    description:
      "One saved job pays for 5 years of this app. Think about it.",
    features: [
      { text: "Unlimited Leads", included: true },
      { text: "Extreme Escalation Mode", included: true },
      { text: "1-Tap Call Routing", included: true },
      { text: "Revenue Saved Tracker", included: true },
    ],
    cta: "GET NAGGED NOW",
    highlighted: true,
    paid: true,
  },
  {
    name: "ANNUAL PRO",
    price: "$89",
    period: "/ year",
    description:
      "Pay once a year, write it off as a software expense, forget about it.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Save $31 instantly", included: true },
      { text: "VIP Priority Support", included: true },
    ],
    cta: "GO ANNUAL",
    highlighted: false,
    paid: true,
  },
];

export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePaidClick(plan: "pro" | "pro_annual") {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Not logged in — send to signup
      window.location.href = "/signup";
      return;
    }

    // Logged in — go to checkout
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) { setLoading(null); return; }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <section
      id="pricing"
      className="py-24 bg-nag-concrete text-black relative z-20 torn-edge"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-loud text-6xl headline mb-4">
            DEAD SIMPLE PRICING.
          </h2>
          <p className="text-xl text-zinc-600 font-medium">
            {PAYMENTS_LIVE
              ? "Costs less than a single fast-food lunch per month."
              : "Start free. Paid plans coming soon."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-end">
          {tiers.map((tier) => {
            const comingSoon = tier.paid && !PAYMENTS_LIVE;
            const isHighlighted = tier.highlighted && !comingSoon;

            const cardClass = comingSoon
              ? "bg-zinc-100 border-4 border-zinc-300 opacity-60"
              : isHighlighted
                ? "bg-black text-white border-4 border-black shadow-brutal-orange transform md:-translate-y-4 z-10"
                : "bg-white border-4 border-black shadow-brutal";

            const nameClass = comingSoon
              ? "text-zinc-400"
              : isHighlighted
                ? "text-nag-orange"
                : tier.paid ? "text-black" : "text-zinc-400";

            const priceClass = comingSoon
              ? "text-zinc-400"
              : isHighlighted
                ? "text-white"
                : "text-black";

            const btnClass = comingSoon
              ? "bg-zinc-300 border-4 border-zinc-400 text-zinc-500 cursor-not-allowed font-loud text-2xl headline"
              : isHighlighted
                ? "bg-nag-orange text-black font-loud text-3xl headline shadow-brutal-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                : "bg-white border-4 border-black text-black hover:bg-black hover:text-white";

            return (
              <div
                key={tier.name}
                className={`${cardClass} p-8 rounded-lg relative flex flex-col ${isHighlighted ? "h-[105%]" : "h-full"}`}
              >
                {comingSoon && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-zinc-400 text-white font-loud text-sm headline px-4 py-1 rounded-sm whitespace-nowrap">
                    COMING SOON
                  </div>
                )}
                {isHighlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-nag-orange text-black font-loud text-xl headline px-4 py-1 rounded-sm border-2 border-black whitespace-nowrap">
                    THE NO-BRAINER
                  </div>
                )}
                <h3
                  className={`font-loud text-4xl headline ${nameClass} mb-2`}
                >
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span
                    className={`font-loud ${isHighlighted ? "text-7xl" : "text-6xl"} headline ${priceClass}`}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className={isHighlighted ? "text-zinc-400" : "text-zinc-500"}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <p
                  className={`${comingSoon ? "text-zinc-400 border-zinc-300" : isHighlighted ? "text-zinc-300 border-zinc-700" : "text-zinc-600 border-zinc-200"} font-medium mb-8 border-b-2 border-dashed pb-6 flex-1`}
                >
                  {tier.description}
                </p>
                <ul className="space-y-4 mb-8 font-medium">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check
                          weight="bold"
                          className={`text-xl ${comingSoon ? "text-zinc-400" : isHighlighted ? "text-nag-orange" : "text-green-500"}`}
                        />
                      ) : (
                        <X
                          weight="bold"
                          className="text-xl text-zinc-300"
                        />
                      )}
                      <span className={!feature.included || comingSoon ? "text-zinc-400" : ""}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                {comingSoon ? (
                  <span
                    className={`w-full block text-center ${btnClass} py-3`}
                  >
                    COMING SOON
                  </span>
                ) : tier.paid ? (
                  <button
                    onClick={() => handlePaidClick(tier.name === "ANNUAL PRO" ? "pro_annual" : "pro")}
                    disabled={loading !== null}
                    className={`w-full block text-center ${btnClass} font-loud ${isHighlighted ? "" : "text-2xl headline"} py-3 transition-all disabled:opacity-50`}
                  >
                    {loading === (tier.name === "ANNUAL PRO" ? "pro_annual" : "pro") ? "REDIRECTING..." : tier.cta}
                  </button>
                ) : (
                  <Link
                    href="/signup"
                    className={`w-full block text-center ${btnClass} font-loud ${isHighlighted ? "" : "text-2xl headline"} py-3 transition-all`}
                  >
                    {tier.cta}
                  </Link>
                )}
                {isHighlighted && (
                  <p className="text-center text-zinc-500 text-xs mt-4">
                    Cancel anytime. No hard feelings.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
