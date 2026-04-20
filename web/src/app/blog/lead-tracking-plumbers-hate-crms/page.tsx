import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lead Tracking for Plumbers Who Hate CRMs",
  description:
    "You became a plumber to fix pipes, not fill out CRM fields. Here's how to track leads and follow up without software that feels like homework.",
  keywords: [
    "plumber lead tracking",
    "plumber CRM",
    "best CRM for plumbers",
    "plumbing lead management",
    "plumber lead follow up",
    "simple CRM plumber",
    "plumbing business leads",
    "lead tracker plumbing business",
  ],
  openGraph: {
    title: "Lead Tracking for Plumbers Who Hate CRMs",
    description:
      "You became a plumber to fix pipes, not fill out CRM fields. Here's a lead system that actually works between jobs.",
    url: "https://naglead.com/blog/lead-tracking-plumbers-hate-crms",
    type: "article",
    publishedTime: "2026-04-17",
  },
  alternates: {
    canonical: "https://naglead.com/blog/lead-tracking-plumbers-hate-crms",
  },
};

export default function PlumbersHateCRMsPost() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <Link href="/blog" className="text-nag-orange text-sm font-semibold hover:underline">
        &larr; Back to blog
      </Link>

      <article className="mt-8">
        <p className="text-zinc-500 text-sm font-medium mb-4">
          April 17, 2026 · 6 min read
        </p>
        <h1 className="font-loud text-4xl sm:text-5xl headline text-white mb-6 leading-tight">
          LEAD TRACKING FOR PLUMBERS WHO HATE CRMS
        </h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 leading-relaxed">
          <p className="text-lg text-zinc-400 font-medium">
            You got into plumbing because you&apos;re good at fixing things.
            Not because you dreamed of logging customer interactions in a
            CRM dashboard at 9pm.
          </p>

          <p>
            But here you are, losing jobs. Not because your work is bad.
            Because you forgot to call Sam back about that water heater, and
            they found someone who answered on the first ring.
          </p>

          <p>
            So you Google &quot;best CRM for plumbers&quot; and every article
            recommends software with 47 features, a 2-hour setup, and a price
            tag that assumes you have a front office. You don&apos;t. You have
            a van, a phone with a cracked screen, and 20 minutes between jobs.
          </p>

          <p>
            This article is for you.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            WHY MOST CRMS FAIL PLUMBERS
          </h2>

          <p>
            The CRM industry was built for sales teams sitting at desks. Then
            they slapped a mobile app on it and called it
            &quot;field-service-ready.&quot; It&apos;s not.
          </p>

          <p>
            Here&apos;s what actually happens when a plumber tries a
            traditional CRM:
          </p>

          <ul className="list-disc list-inside space-y-3">
            <li>
              <strong className="text-white">Week 1:</strong> You set it up,
              enter your leads, feel organized for the first time in months.
            </li>
            <li>
              <strong className="text-white">Week 2:</strong> You skip
              entering a lead because you&apos;re crawling out from under a
              sink and your hands are covered in PVC cement.
            </li>
            <li>
              <strong className="text-white">Week 3:</strong> Half your leads
              are in the CRM, half are in texts and voicemails. Now you have
              two systems to check instead of one.
            </li>
            <li>
              <strong className="text-white">Week 4:</strong> You stop
              opening the CRM entirely. Back to memory and missed calls.
            </li>
          </ul>

          <p>
            This isn&apos;t a willpower problem. It&apos;s a design problem.
            The tool doesn&apos;t fit how you work.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            WHAT PLUMBERS ACTUALLY NEED
          </h2>

          <p>
            Talk to enough plumbers about their lead process and a pattern
            emerges. The ones who close the most jobs don&apos;t have the
            fanciest software. They have the fastest callback time.
          </p>

          <p>
            A{" "}
            <a
              href="https://cdn2.hubspot.net/hub/25649/file-13535879-pdf/docs/mit_study.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nag-orange hover:underline"
            >
              well-known study on lead response times
            </a>{" "}
            found that responding within 5 minutes makes you 21x more likely
            to qualify the lead. In plumbing, where the customer has an active
            leak or a broken water heater, that window might be even shorter.
          </p>

          <p>
            What plumbers need isn&apos;t a CRM. It&apos;s three things:
          </p>

          <ol className="list-decimal list-inside space-y-3">
            <li>
              <strong className="text-white">A place to dump leads fast</strong>{" "}
              (name, what they need, done). Not 12 required fields.
            </li>
            <li>
              <strong className="text-white">Something that nags you to
              call back</strong>{" "}
              because between a slab leak and a toilet install, you will
              forget. That&apos;s not a character flaw. That&apos;s Tuesday.
            </li>
            <li>
              <strong className="text-white">A way to know who&apos;s still
              waiting</strong>{" "}
              so you can open your phone, see the list, make the call. No clicking
              through tabs, pipelines, or dashboards.
            </li>
          </ol>

          <p>
            Everything else (invoicing, scheduling, route optimization,
            customer portals) is either handled by other tools you already
            use or is a problem for future you with employees.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            THE REAL COST OF FORGETTING TO CALL BACK
          </h2>

          <p>
            Let&apos;s do some napkin math for a solo plumber.
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Average plumbing job value</span>
              <span className="text-white font-semibold">$350</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Leads per month</span>
              <span className="text-white font-semibold">20</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Leads you forget or respond to too late</span>
              <span className="text-white font-semibold">3-5</span>
            </div>
            <div className="flex justify-between text-sm border-t border-zinc-700 pt-3">
              <span className="text-nag-orange font-semibold">Revenue lost per month</span>
              <span className="text-nag-orange font-semibold">$1,050 - $1,750</span>
            </div>
          </div>

          <p>
            That&apos;s $12,000-$21,000 per year walking out the door because
            nobody reminded you to call back. And that&apos;s conservative.
            A{" "}
            <a
              href="https://suzeeai.com/home-services-why-plumbers-lose-50k-year-to-missed-calls/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nag-orange hover:underline"
            >
              study of service businesses
            </a>{" "}
            puts the average missed-call rate at 28%.
          </p>

          <p>
            You don&apos;t need a CRM to fix this. You need a nag.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            A SYSTEM THAT WORKS BETWEEN JOBS
          </h2>

          <p>
            Here&apos;s what a plumber-friendly lead system looks like:
          </p>

          <p>
            <strong className="text-white">1. Lead comes in</strong>: a
            voicemail, a text, a Yelp message, a &quot;my toilet is
            flooding&quot; email from your website. You open your phone and
            add it in 5 seconds: &quot;Pat, kitchen faucet replacement.&quot;
          </p>

          <p>
            <strong className="text-white">2. You get nagged</strong>. 2
            hours later, your phone buzzes: &quot;Pat is still waiting.&quot;
            You&apos;re under a house. You ignore it. 6 hours later, another
            one. 24 hours later, another one. They{" "}
            <Link
              href="/blog/cleaning-business-lead-follow-up"
              className="text-nag-orange hover:underline"
            >
              escalate until you deal with it
            </Link>
            .
          </p>

          <p>
            <strong className="text-white">3. You call back</strong>. Tap the
            lead, tap call. Mark it won or lost. It&apos;s off your plate.
          </p>

          <p>
            <strong className="text-white">4. Repeat</strong>. No weekly
            reviews, no pipeline management, no &quot;CRM hygiene.&quot;
            Just: who&apos;s waiting? Call them.
          </p>

          <p>
            That&apos;s it. The entire system runs on push notifications and
            guilt. It works because it&apos;s impossible to ignore.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            &quot;BUT I ALREADY HAVE A SYSTEM&quot;
          </h2>

          <p>
            Let&apos;s be honest about what &quot;a system&quot; usually means
            for solo plumbers:
          </p>

          <ul className="list-disc list-inside space-y-3">
            <li>
              <strong className="text-white">&quot;I write it on my
              hand&quot;</strong>{" "}
              Works until you wash your hands. Which, as a plumber, you do
              constantly.
            </li>
            <li>
              <strong className="text-white">&quot;I keep a notebook in the
              van&quot;</strong>{" "}
              Great until you&apos;re at Home Depot and the notebook is in
              the van and the van is at the last job site.
            </li>
            <li>
              <strong className="text-white">&quot;My partner handles
              it&quot;</strong>{" "}
              Solid if they&apos;re available 24/7. Less solid when
              they&apos;re at their own job and a lead calls at 2pm.
            </li>
            <li>
              <strong className="text-white">&quot;I just remember&quot;</strong>{" "}
              You remember the big jobs. You forget the $200 faucet repair
              that would have taken 30 minutes. Multiply that by 15 per year.
            </li>
          </ul>

          <p>
            None of these systems nag you. That&apos;s the problem. A
            list without reminders is just a list of people you&apos;ll
            feel bad about forgetting later.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            WHAT ABOUT JOBBER, HOUSECALL PRO, ETC.?
          </h2>

          <p>
            These are solid tools for plumbing companies with employees,
            dispatch needs, and invoice volume. If you have 3+ trucks on the
            road and need scheduling, quoting, and payment processing,{" "}
            <a
              href="https://www.getjobber.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nag-orange hover:underline"
            >
              Jobber
            </a>{" "}
            or Housecall Pro earns its $40-200/month.
          </p>

          <p>
            But if you&apos;re solo, here&apos;s what you&apos;re actually
            paying for:
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 bg-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wide px-4 py-3">
              <span>Feature</span>
              <span className="text-right">Do you use it?</span>
            </div>
            <div className="grid grid-cols-2 px-4 py-3 border-t border-zinc-800 text-sm">
              <span className="text-zinc-300">Dispatching</span>
              <span className="text-zinc-500 text-right">No, it&apos;s just you</span>
            </div>
            <div className="grid grid-cols-2 px-4 py-3 border-t border-zinc-800 text-sm">
              <span className="text-zinc-300">Route optimization</span>
              <span className="text-zinc-500 text-right">No, you know your area</span>
            </div>
            <div className="grid grid-cols-2 px-4 py-3 border-t border-zinc-800 text-sm">
              <span className="text-zinc-300">Team scheduling</span>
              <span className="text-zinc-500 text-right">No, there&apos;s no team</span>
            </div>
            <div className="grid grid-cols-2 px-4 py-3 border-t border-zinc-800 text-sm">
              <span className="text-zinc-300">Custom quoting</span>
              <span className="text-zinc-500 text-right">No, you quote on the spot</span>
            </div>
            <div className="grid grid-cols-2 px-4 py-3 border-t border-zinc-800 text-sm">
              <span className="text-zinc-300">Online booking portal</span>
              <span className="text-zinc-500 text-right">No, people call or text</span>
            </div>
            <div className="grid grid-cols-2 px-4 py-3 border-t border-zinc-700 text-sm bg-zinc-800/50">
              <span className="text-nag-orange font-semibold">Lead follow-up reminders</span>
              <span className="text-nag-orange font-semibold text-right">Yes, this is all you need</span>
            </div>
          </div>

          <p>
            You&apos;re paying $40-200/month and using 10% of the features.
            That&apos;s not smart spending. That&apos;s paying for someone
            else&apos;s complexity.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            AUTO-ADD LEADS WITHOUT TYPING
          </h2>

          <p>
            The best lead system is one where you barely interact with it.
            If you get leads from Yelp, Thumbtack, Angi, or your website
            contact form, they all come to your email first.
          </p>

          <p>
            Forward those emails to your{" "}
            <Link
              href="/blog/auto-add-leads-from-email"
              className="text-nag-orange hover:underline"
            >
              NagLead intake address
            </Link>{" "}
            and leads create themselves. AI reads the email, extracts the
            name, phone number, and what they need, then starts the nag
            clock automatically. You don&apos;t type anything.
          </p>

          <p>
            &quot;Jordan, water heater replacement, needs it before
            Friday&quot; just appears in your inbox, and the reminders start.
            All you have to do is call.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            THE PLUMBER&apos;S LEAD TRACKING DECISION
          </h2>

          <p>
            Here&apos;s the honest breakdown:
          </p>

          <ul className="list-disc list-inside space-y-3">
            <li>
              <strong className="text-white">Under 5 leads/month:</strong>{" "}
              Your phone is fine. Don&apos;t buy anything.
            </li>
            <li>
              <strong className="text-white">5-30 leads/month, solo:</strong>{" "}
              You need reminders, not a CRM. Something that nags you to
              call back. That&apos;s the whole job.
            </li>
            <li>
              <strong className="text-white">Growing with employees:</strong>{" "}
              Now Jobber or Housecall Pro makes sense. You need dispatching,
              scheduling, and invoicing.
            </li>
          </ul>

          <p>
            Most solo plumbers are in that middle bucket. Getting enough
            leads to lose track of some, but not enough to justify a
            $50/month all-in-one platform.
          </p>

          <h2 className="font-loud text-3xl headline text-white pt-4">
            STOP PAYING FOR SOFTWARE YOU HATE
          </h2>

          <p>
            You don&apos;t hate CRMs because you&apos;re bad at technology.
            You hate them because they were built for someone sitting at a
            desk with clean hands and an empty calendar. That&apos;s not your
            life.
          </p>

          <p>
            Your life is: the phone rings while you&apos;re soldering a
            copper joint. You can&apos;t answer. By the time you remember,
            it&apos;s 6pm and you&apos;re exhausted and the lead has already
            called two other plumbers.
          </p>

          <p>
            The fix isn&apos;t discipline. The fix is a tool annoying enough
            to interrupt your exhaustion and remind you that Pat&apos;s
            kitchen faucet is still waiting.
          </p>

          <p>
            That&apos;s{" "}
            <Link
              href="/blog/missed-leads-cost-service-business"
              className="text-nag-orange hover:underline"
            >
              the whole idea behind a nag engine
            </Link>
            . Not more features. More persistence.
          </p>

          <div className="bg-zinc-900 border-2 border-nag-orange rounded-xl p-8 text-center mt-8">
            <p className="font-loud text-3xl headline text-white mb-3">
              TRY IT WITH YOUR NEXT 5 LEADS
            </p>
            <p className="text-zinc-400 mb-6">
              NagLead is free for up to 5 active leads. No credit card, no
              setup wizard, no 14-day trial. Just add a lead and see if the
              nagging works.
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
