import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What You Get with NagLead Pro ($10/month)",
  description:
    "NagLead Pro unlocks unlimited leads, auto-add from email, monthly scorecards, and more. Here's exactly what $10/month gets you.",
  keywords: [
    "naglead pro",
    "naglead pricing",
    "naglead features",
    "naglead pro vs free",
    "lead tracker pro plan",
  ],
  openGraph: {
    title: "What You Get with NagLead Pro ($10/month)",
    description:
      "Unlimited leads, auto-add from email, monthly scorecards. Here's exactly what $10/month gets you.",
    url: "https://naglead.com/blog/naglead-pro-features",
    type: "article",
    publishedTime: "2026-04-13",
  },
  alternates: {
    canonical: "https://naglead.com/blog/naglead-pro-features",
  },
};

export default function NagLeadProFeaturesPost() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <Link href="/blog" className="text-nag-orange text-sm font-semibold hover:underline">
        &larr; Back to blog
      </Link>

      <article className="mt-8">
        <p className="text-zinc-500 text-sm font-medium mb-4">
          April 13, 2026 · 4 min read
        </p>
        <h1 className="font-loud text-4xl sm:text-5xl headline text-white mb-6 leading-tight">
          WHAT YOU GET WITH NAGLEAD PRO
        </h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 leading-relaxed">
          <p className="text-lg text-zinc-400 font-medium">
            The free plan gives you 5 active leads and the full nag engine.
            That&apos;s enough to prove it works. Pro is for when you&apos;re
            ready to stop losing money.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            FREE VS PRO
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 pr-4 text-zinc-400 font-bold">Feature</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-bold">Free</th>
                  <th className="text-left py-3 pl-4 text-nag-orange font-bold">Pro ($10/mo)</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800">
                  <td className="py-3 pr-4 text-zinc-400">Active leads</td>
                  <td className="py-3 px-4">5</td>
                  <td className="py-3 pl-4 text-white font-bold">Unlimited</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3 pr-4 text-zinc-400">Nag reminders</td>
                  <td className="py-3 px-4">Yes</td>
                  <td className="py-3 pl-4">Yes</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3 pr-4 text-zinc-400">Snooze leads</td>
                  <td className="py-3 px-4">Yes</td>
                  <td className="py-3 pl-4">Yes</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3 pr-4 text-zinc-400">Won/lost tracking</td>
                  <td className="py-3 px-4">Yes</td>
                  <td className="py-3 pl-4">Yes</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3 pr-4 text-zinc-400">Monthly scorecard</td>
                  <td className="py-3 px-4">Yes</td>
                  <td className="py-3 pl-4">Yes</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3 pr-4 text-zinc-400">Auto-add leads from email</td>
                  <td className="py-3 px-4 text-zinc-600">No</td>
                  <td className="py-3 pl-4 text-white font-bold">Yes</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3 pr-4 text-zinc-400">Quiet hours</td>
                  <td className="py-3 px-4">Yes</td>
                  <td className="py-3 pl-4">Yes</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-zinc-400">Phone number (coming soon)</td>
                  <td className="py-3 px-4 text-zinc-600">No</td>
                  <td className="py-3 pl-4 text-white font-bold">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            UNLIMITED LEADS
          </h2>

          <p>
            The free plan caps you at 5 active leads. That sounds like plenty
            until a busy week hits and you&apos;ve got 3 in &quot;Reply Now&quot;
            and 4 in &quot;Waiting&quot; — and a new quote request comes in
            that you literally can&apos;t add.
          </p>

          <p>
            Pro removes the cap. Add as many leads as you want. Most solo
            cleaners have 10-25 active leads at any given time. Plumbers and
            electricians with higher job values might have fewer but they&apos;re
            worth more — one lost lead at $500 is a month of NagLead.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            AUTO-ADD LEADS FROM EMAIL
          </h2>

          <p>
            This is the feature that saves the most time. Pro gives you a
            dedicated email address like{" "}
            <code className="text-nag-orange bg-zinc-800 px-2 py-0.5 rounded text-sm">
              leads+brave-falcon@naglead.com
            </code>
          </p>

          <p>
            Set up a forwarding rule in Gmail, Outlook, or Yahoo so that lead
            emails automatically go to your NagLead address. Then:
          </p>

          <ol className="list-decimal list-inside space-y-2">
            <li>Customer fills out your website form</li>
            <li>Yelp sends you a &quot;New customer request&quot; notification</li>
            <li>Thumbtack alerts you about a new lead</li>
          </ol>

          <p>
            Each one automatically appears in your NagLead inbox with the
            customer&apos;s name, phone, email, and what they need —
            extracted by AI. No manual entry. The lead starts getting nagged
            immediately, even if you&apos;re on a job and don&apos;t see it
            for hours.
          </p>

          <p>
            We wrote a{" "}
            <Link
              href="/blog/cleaning-business-lead-follow-up"
              className="text-nag-orange hover:underline"
            >
              full walkthrough
            </Link>{" "}
            of how this works for cleaning businesses.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            MONTHLY SCORECARD
          </h2>

          <p>
            Both free and Pro get the scorecard, but it becomes a lot more
            useful with unlimited leads. At the end of each month you see:
          </p>

          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-white">New leads</strong> — how many inquiries came in</li>
            <li><strong className="text-white">Won</strong> — how many turned into jobs (and the revenue)</li>
            <li><strong className="text-white">Lost</strong> — how many didn&apos;t work out</li>
            <li><strong className="text-white">Win rate</strong> — your close percentage</li>
            <li><strong className="text-white">Avg reply time</strong> — how fast you respond</li>
            <li><strong className="text-white">Follow-up rate</strong> — % of leads you actually responded to</li>
          </ul>

          <p>
            Most solo service businesses have never seen these numbers before.
            The first time you see a 60% win rate and realize 40% of your
            leads aren&apos;t converting, you start asking why — and that&apos;s{" "}
            <Link
              href="/blog/missed-leads-cost-service-business"
              className="text-nag-orange hover:underline"
            >
              where the real money is
            </Link>
            .
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            COMING SOON: DEDICATED PHONE NUMBER
          </h2>

          <p>
            We&apos;re building a feature where Pro users get a local phone
            number. When a customer calls and you can&apos;t answer, the call
            forwards to your NagLead number, which captures the caller&apos;s
            number and automatically creates a lead. No voicemail needed —
            the customer hears a brief message and you get a notification
            to call them back.
          </p>

          <p>
            Same idea as the email auto-add, but for phone calls. Because
            the{" "}
            <Link
              href="/blog/best-lead-tracker-cleaning-business-2026"
              className="text-nag-orange hover:underline"
            >
              #1 complaint from service businesses
            </Link>{" "}
            is missed calls while on a job.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            THE MATH
          </h2>

          <p>
            Pro costs $10/month. Annual saves you more at $89/year ($7.42/month).
          </p>

          <p>
            The average cleaning job is $150-250. The average plumbing call is
            $275. One recovered lead — one job you would have lost because you
            forgot to call back — pays for an entire year of NagLead Pro.
          </p>

          <p>
            You don&apos;t need to recover a lead every month. Just one per year.
          </p>

          <div className="bg-zinc-900 border-2 border-nag-orange rounded-xl p-8 text-center mt-8">
            <p className="font-loud text-3xl headline text-white mb-3">
              START FREE, UPGRADE WHEN YOU HIT 5
            </p>
            <p className="text-zinc-400 mb-6">
              The free plan has everything except the cap and email auto-add.
              You&apos;ll know when you need Pro.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-nag-orange text-black font-loud text-2xl headline px-8 py-3 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              START FREE
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
