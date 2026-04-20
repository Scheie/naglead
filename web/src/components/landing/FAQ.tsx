"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

const faqs = [
  {
    q: "What is NagLead?",
    a: "A dead-simple lead tracker for solo service businesses. Add a lead in 5 seconds, and it sends escalating reminders until you call them back. It's not a CRM. It's a nag engine.",
  },
  {
    q: "How is this different from a CRM?",
    a: "CRMs like Jobber ($39/month) and HubSpot are built for teams with pipelines, scheduling, and invoicing. NagLead does one thing: it won't let you forget to call someone back. No pipeline, no automations, just escalating reminders.",
  },
  {
    q: "What types of businesses use NagLead?",
    a: "Solo service businesses: cleaners, plumbers, electricians, landscapers, painters, handymen, and photographers. Anyone who gets leads on their phone and sometimes forgets to follow up.",
  },
  {
    q: "How do the nag reminders work?",
    a: "Push notifications that escalate: a friendly nudge at 2 hours, a firm reminder at 6 hours, a warning at 24 hours, and an urgent alert at 48 hours. They continue until you mark the lead as replied, won, or lost.",
  },
  {
    q: "Can it automatically add leads from email?",
    a: "Yes! Pro users get a dedicated email address. Forward lead emails from Yelp, Thumbtack, website forms, or any source. NagLead automatically extracts the customer's name, phone, email, and what they need using AI.",
  },
  {
    q: "How much does it cost?",
    a: "Free for up to 5 active leads, forever. Pro is $10/month or $89/year for unlimited leads, auto-add from email, and more. One saved lead pays for an entire year.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-nag-dark">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-loud text-6xl headline text-white text-center mb-16">
          QUESTIONS?
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <button
              key={i}
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-nag-orange"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-bold text-white text-lg">{faq.q}</h3>
                <CaretDown
                  weight="bold"
                  className={`text-zinc-400 text-xl shrink-0 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </div>
              {open === i && (
                <p className="text-zinc-400 mt-4 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
