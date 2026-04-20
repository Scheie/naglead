import Link from "next/link";
import { LegalHeader } from "@/components/landing/LegalHeader";

export const metadata = {
  title: "Privacy Policy | NagLead",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-nag-dark text-white">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-loud text-5xl headline text-white mb-8">
          PRIVACY POLICY
        </h1>
        <p className="text-zinc-400 text-sm mb-12">
          Last updated: April 4, 2026
        </p>

        <div className="prose-invert space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              WHAT WE COLLECT
            </h2>
            <p>
              When you use NagLead, we collect the minimum information needed to
              provide the service:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Account info:</strong> Your
                email address, name, and trade/profession
              </li>
              <li>
                <strong className="text-zinc-200">Lead data:</strong> Names,
                phone numbers, email addresses, and descriptions you enter for
                your leads
              </li>
              <li>
                <strong className="text-zinc-200">Activity data:</strong>{" "}
                Timestamps of actions (lead created, replied, won, lost) for
                your scorecard metrics
              </li>
              <li>
                <strong className="text-zinc-200">Usage analytics:</strong>{" "}
                Anonymized product usage data to improve the app (via PostHog)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              WHAT WE DON&apos;T DO
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
              <li>We never sell your data or your leads&apos; data to anyone</li>
              <li>We never share individual lead information with third parties</li>
              <li>We never use your lead data for advertising or marketing purposes</li>
              <li>We never contact your leads directly</li>
            </ul>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              YOUR LEAD DATA BELONGS TO YOU
            </h2>
            <p>
              The leads you add to NagLead are your business contacts. We are a
              tool that helps you manage them. We are not the owner of that
              data. You can export all your leads as a CSV file at any time, and
              you can delete your account and all associated data whenever you
              want.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              HOW WE STORE YOUR DATA
            </h2>
            <p>
              Your data is stored securely in Supabase (PostgreSQL) with
              row-level security enabled, meaning each user can only access
              their own data at the database level. We use encrypted connections
              (HTTPS/TLS) for all data in transit.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              THIRD-PARTY SERVICES
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Supabase:</strong> Database
                and authentication
              </li>
              <li>
                <strong className="text-zinc-200">Stripe:</strong> Payment
                processing (we never see or store your credit card number)
              </li>
              <li>
                <strong className="text-zinc-200">Expo / Firebase / APNs:</strong>{" "}
                Push notification delivery
              </li>
              <li>
                <strong className="text-zinc-200">PostHog:</strong> Anonymized
                product analytics
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              YOUR RIGHTS
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-zinc-400">
              <li>Access all data we have about you</li>
              <li>Export your leads (CSV download)</li>
              <li>Correct any inaccurate information</li>
              <li>
                Delete your account and all associated data permanently
              </li>
              <li>Opt out of analytics tracking</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a
                href="mailto:privacy@naglead.com"
                className="text-nag-orange hover:underline"
              >
                privacy@naglead.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              COOKIES
            </h2>
            <p>
              We use essential cookies only, for authentication session
              management. No tracking cookies, no advertising cookies, no
              third-party cookies.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              CHANGES TO THIS POLICY
            </h2>
            <p>
              If we make significant changes to this policy, we&apos;ll notify you
              via email or in-app notification. Minor changes (clarifications,
              formatting) may be made without notice.
            </p>
          </section>

          <section>
            <h2 className="font-loud text-2xl headline text-white mb-3">
              CONTACT
            </h2>
            <p>
              Questions about privacy? Email{" "}
              <a
                href="mailto:privacy@naglead.com"
                className="text-nag-orange hover:underline"
              >
                privacy@naglead.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
