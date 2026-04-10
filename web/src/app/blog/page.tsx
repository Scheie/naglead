import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NagLead Blog — Lead Tracking Tips for Service Businesses",
  description:
    "Practical advice on lead follow-up, customer management, and growing your service business. No fluff, no CRM jargon.",
};

const posts = [
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
