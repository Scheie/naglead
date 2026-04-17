import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NagLead Blog — Lead Tracking Tips for Service Businesses",
  description:
    "Practical advice on lead follow-up, customer management, and growing your service business. No fluff, no CRM jargon.",
};

const posts = [
  {
    slug: "lead-tracking-plumbers-hate-crms",
    title: "Lead Tracking for Plumbers Who Hate CRMs",
    description:
      "You became a plumber to fix pipes, not fill out CRM fields. Here's how to track leads and follow up without software that feels like homework.",
    date: "2026-04-17",
    readTime: "6 min read",
  },
  {
    slug: "missed-call-lead-capture",
    title: "Missed Call Lead Capture for Service Businesses — Coming Soon",
    description:
      "62% of calls to service businesses go unanswered. NagLead is building a dedicated business phone number that turns every missed call and text into a lead automatically.",
    date: "2026-04-16",
    readTime: "6 min read",
  },
  {
    slug: "stop-tracking-leads-in-spreadsheets",
    title: "Stop Tracking Leads in a Spreadsheet (It's Costing You Jobs)",
    description:
      "A spreadsheet doesn't remind you to call back. It just sits there while your leads go cold. Here's why service businesses lose jobs to their own tracking system.",
    date: "2026-04-15",
    readTime: "5 min read",
  },
  {
    slug: "auto-add-leads-from-email",
    title: "Never Miss a Lead Again: Auto-Add Leads from Email",
    description:
      "Forward your Yelp, Thumbtack, and website form emails to NagLead and leads create themselves. AI extracts the name, phone, and what they need.",
    date: "2026-04-14",
    readTime: "5 min read",
  },
  {
    slug: "naglead-pro-features",
    title: "What You Get with NagLead Pro ($10/month)",
    description:
      "NagLead Pro unlocks unlimited leads, auto-add from email, monthly scorecards, and more. Here's exactly what $10/month gets you.",
    date: "2026-04-13",
    readTime: "4 min read",
  },
  {
    slug: "best-lead-tracker-cleaning-business-2026",
    title: "Best Lead Tracker for Cleaning Businesses in 2026",
    description:
      "An honest look at 6 tools for tracking cleaning leads — from free options to full CRMs. Which one actually fits a solo cleaner's workflow?",
    date: "2026-04-12",
    readTime: "7 min read",
  },
  {
    slug: "naglead-vs-less-annoying-crm",
    title: "NagLead vs Less Annoying CRM: Which One for Service Businesses?",
    description:
      "Less Annoying CRM does everything simply. NagLead does one thing aggressively. Here's which one fits your service business.",
    date: "2026-04-11",
    readTime: "5 min read",
  },
  {
    slug: "missed-leads-cost-service-business",
    title: "What a Missed Lead Actually Costs Your Service Business",
    description:
      "The average service business misses 28% of incoming leads. Here's exactly how much that costs you per month — and the embarrassingly simple fix.",
    date: "2026-04-10",
    readTime: "5 min read",
  },
  {
    slug: "naglead-vs-jobber",
    title: "NagLead vs Jobber: Which Is Right for Solo Cleaners?",
    description:
      "Jobber starts at $39/month and is built for teams. NagLead is $10/month and built for one-person cleaning businesses. Here's an honest comparison.",
    date: "2026-04-10",
    readTime: "6 min read",
  },
  {
    slug: "cleaning-business-lead-follow-up",
    title: "How to Follow Up on Cleaning Leads Without a CRM",
    description:
      "You don't need a $40/month CRM to stop losing cleaning jobs. Here's a dead-simple system that actually works for solo cleaners.",
    date: "2026-04-09",
    readTime: "5 min read",
  },
];

export default function BlogPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <Link href="/" className="text-nag-orange font-loud text-2xl headline hover:underline">
        NAGLEAD
      </Link>

      <h1 className="font-loud text-5xl headline text-white mt-8 mb-4">
        THE BLOG
      </h1>
      <p className="text-zinc-400 font-medium mb-12">
        Practical advice on lead follow-up for service businesses. No fluff.
      </p>

      <div className="space-y-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors"
          >
            <p className="text-zinc-500 text-sm font-medium mb-2">
              {post.date} · {post.readTime}
            </p>
            <h2 className="font-loud text-2xl headline text-white mb-2">
              {post.title}
            </h2>
            <p className="text-zinc-400 text-sm">{post.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
