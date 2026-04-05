import Link from "next/link";
import { LegalHeader } from "@/components/landing/LegalHeader";

export const metadata = {
  title: "Terms of Service — NagLead",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-nag-dark text-white">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-loud text-5xl headline text-white mb-8">
          TERMS OF SERVICE
        </h1>
        <p className="text-zinc-400 text-sm mb-12">
          Last updated: April 4, 2026
        </p>

        <div className="prose-invert space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              THE SHORT VERSION
            </h2>
            <p>
              NagLead is a lead reminder tool. You add your leads, we nag you to
              follow up. You pay us $10/month (or $89/year) for the full
              version. Don&apos;t use it for anything illegal. We&apos;ll do our best to
              keep it running. That&apos;s basically it.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              THE SERVICE
            </h2>
            <p>
              NagLead (&quot;the Service&quot;) is operated by NagLead Systems
              (&quot;we&quot;, &quot;us&quot;). The Service provides a lead tracking and reminder
              system accessible via web application and mobile applications.
            </p>
            <p className="mt-3">
              By creating an account, you agree to these terms. If you
              don&apos;t agree, don&apos;t use the service — no hard feelings.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              YOUR ACCOUNT
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
              <li>You must provide accurate information when signing up</li>
              <li>You are responsible for keeping your login credentials secure</li>
              <li>One account per person (no sharing accounts between team members on solo plans)</li>
              <li>You must be at least 18 years old to use NagLead</li>
            </ul>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              FREE & PAID PLANS
            </h2>
            <p>
              <strong className="text-zinc-200">Free plan:</strong> Up to 5
              active leads, basic nagging. May be subject to feature
              limitations.
            </p>
            <p className="mt-2">
              <strong className="text-zinc-200">Pro plan ($10/month):</strong>{" "}
              Unlimited leads, all features. Billed monthly via Stripe.
            </p>
            <p className="mt-2">
              <strong className="text-zinc-200">
                Pro Annual ($89/year):
              </strong>{" "}
              Same as Pro, billed annually. Save $31/year.
            </p>
            <p className="mt-3">
              You can cancel your subscription at any time. You&apos;ll retain
              access until the end of your billing period. No refunds for
              partial months, but if you&apos;re unhappy within the first 14 days,
              email us and we&apos;ll refund you.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              YOUR DATA
            </h2>
            <p>
              You own your data. The leads, contacts, and business information
              you put into NagLead belong to you. We don&apos;t claim any ownership
              or license to your content. See our{" "}
              <Link
                href="/privacy"
                className="text-nag-orange hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              for details on how we handle your data.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              ACCEPTABLE USE
            </h2>
            <p>Don&apos;t use NagLead to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-zinc-400">
              <li>Store or transmit illegal content</li>
              <li>Spam or harass people via the contact features</li>
              <li>
                Attempt to access other users&apos; data or compromise the service
              </li>
              <li>Resell the service without our permission</li>
              <li>Reverse engineer or copy the software</li>
            </ul>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              UPTIME & LIABILITY
            </h2>
            <p>
              We aim for high availability but don&apos;t guarantee 100% uptime.
              Things break sometimes. We&apos;ll fix them as fast as we can.
            </p>
            <p className="mt-3">
              NagLead is a reminder tool — we are not responsible for lost
              business, missed leads, or any damages resulting from
              notifications not being delivered. Push notifications depend on
              third-party services (Apple, Google) that are outside our control.
            </p>
            <p className="mt-3">
              Our total liability is limited to the amount you&apos;ve paid us in
              the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              TERMINATION
            </h2>
            <p>
              You can delete your account at any time. We can terminate your
              account if you violate these terms (we&apos;ll warn you first unless
              it&apos;s something egregious). On termination, your data will be
              deleted within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              CHANGES
            </h2>
            <p>
              We may update these terms. Significant changes will be
              communicated via email. Continued use after changes constitutes
              acceptance.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              CONTACT
            </h2>
            <p>
              Questions? Email{" "}
              <a
                href="mailto:hello@naglead.com"
                className="text-nag-orange hover:underline"
              >
                hello@naglead.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
