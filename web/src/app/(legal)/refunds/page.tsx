import { LegalHeader } from "@/components/landing/LegalHeader";

export const metadata = {
  title: "Refund & Cancellation Policy — NagLead",
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-nag-dark text-white">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-loud text-5xl headline text-white mb-8">
          REFUND & CANCELLATION POLICY
        </h1>
        <p className="text-zinc-400 text-sm mb-12">
          Last updated: April 7, 2026
        </p>

        <div className="prose-invert space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              THE SHORT VERSION
            </h2>
            <p>
              Cancel anytime. No questions asked. If you&apos;re not happy within the
              first 14 days, we&apos;ll give you a full refund.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              FREE PLAN
            </h2>
            <p>
              The free plan is free forever. No credit card required. You can use
              it as long as you want with up to 5 active leads.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              PAID PLANS
            </h2>
            <ul className="list-disc pl-6 space-y-3 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Monthly ($10/month):</strong>{" "}
                Billed monthly. Cancel anytime from your account settings. You
                keep access until the end of your billing period.
              </li>
              <li>
                <strong className="text-zinc-200">Annual ($89/year):</strong>{" "}
                Billed once per year. Cancel anytime. You keep access until the
                end of your annual billing period.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              HOW TO CANCEL
            </h2>
            <p>
              Go to Settings in the app and manage your subscription. Cancellation
              takes effect at the end of your current billing period. You won&apos;t
              be charged again.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              REFUNDS
            </h2>
            <ul className="list-disc pl-6 space-y-3 text-zinc-400">
              <li>
                <strong className="text-zinc-200">14-day guarantee:</strong>{" "}
                If you upgrade to a paid plan and decide it&apos;s not for you within
                14 days, email us at{" "}
                <a
                  href="mailto:hello@naglead.com"
                  className="text-nag-orange hover:underline"
                >
                  hello@naglead.com
                </a>{" "}
                and we&apos;ll issue a full refund. No questions asked.
              </li>
              <li>
                <strong className="text-zinc-200">After 14 days:</strong>{" "}
                No refunds for partial billing periods. You can cancel anytime and
                your access continues until the end of the period you&apos;ve paid for.
              </li>
              <li>
                <strong className="text-zinc-200">Annual plans:</strong>{" "}
                Refund requests for annual plans are considered on a case-by-case
                basis after the 14-day window. Contact us and we&apos;ll work something out.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              YOUR DATA AFTER CANCELLATION
            </h2>
            <p>
              When you cancel, your data stays in your account until the end of
              your billing period. After that, your account reverts to the free
              plan. You can export your leads as CSV at any time from Settings.
            </p>
            <p className="mt-3">
              If you delete your account entirely, all data is permanently removed
              within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              QUESTIONS?
            </h2>
            <p>
              Email us at{" "}
              <a
                href="mailto:hello@naglead.com"
                className="text-nag-orange hover:underline"
              >
                hello@naglead.com
              </a>
              . We respond within 24 hours.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
