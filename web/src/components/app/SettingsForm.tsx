"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Moon,
  Clock,
  User,
  SignOut,
  Trash,
  DownloadSimple,
  EnvelopeSimple,
  Copy,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { User as UserProfile } from "@/lib/database.types";
import { leadsToCSV, downloadCSV } from "@/lib/export-csv";
import { countryCodes } from "@/lib/country-codes";

interface SettingsFormProps {
  profile: UserProfile;
}

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Berlin",
  "Australia/Sydney",
  "Australia/Perth",
];

export function SettingsForm({ profile }: SettingsFormProps) {
  const [name, setName] = useState(profile.name);
  const [businessName, setBusinessName] = useState(profile.business_name ?? "");
  const [trade, setTrade] = useState(profile.trade ?? "");
  const [timezone, setTimezone] = useState(profile.timezone);
  const [nagEnabled, setNagEnabled] = useState(profile.nag_enabled);
  const [quietStart, setQuietStart] = useState(profile.nag_quiet_start);
  const [quietEnd, setQuietEnd] = useState(profile.nag_quiet_end);
  const [userCountry, setUserCountry] = useState(profile.country ?? "US");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedIntake, setCopiedIntake] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const intakeEmail = `${profile.id}@leads.naglead.com`;
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("users")
      .update({
        name,
        business_name: businessName || null,
        trade: trade || null,
        timezone,
        nag_enabled: nagEnabled,
        nag_quiet_start: quietStart,
        nag_quiet_end: quietEnd,
        country: userCountry,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      setSaved(false);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-nag-dark/95 backdrop-blur-md border-b-2 border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/app"
            className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft weight="bold" />
          </Link>
          <h1 className="font-loud text-2xl headline text-white">SETTINGS</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Profile */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <User weight="bold" />
            <h2 className="font-loud text-xl headline uppercase">Profile</h2>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-zinc-900 border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Trade
            </label>
            <input
              type="text"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="w-full bg-zinc-900 border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
              placeholder="Plumber, Electrician, etc."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Email
            </label>
            <p className="px-4 py-3 text-zinc-500 font-medium">
              {profile.email}
            </p>
          </div>
        </section>

        {/* Nag Settings */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <Bell weight="bold" />
            <h2 className="font-loud text-xl headline uppercase">
              Nag Settings
            </h2>
          </div>

          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div>
              <p className="font-semibold text-white">Nag Notifications</p>
              <p className="text-sm text-zinc-500">
                {nagEnabled
                  ? "We'll nag you about unanswered leads"
                  : "Nagging is paused — leads may go cold"}
              </p>
            </div>
            <button
              onClick={() => setNagEnabled(!nagEnabled)}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                nagEnabled ? "bg-nag-orange" : "bg-zinc-700"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  nagEnabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Quiet Hours */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <Moon weight="bold" />
            <h2 className="font-loud text-xl headline uppercase">
              Quiet Hours
            </h2>
          </div>
          <p className="text-sm text-zinc-500 -mt-2">
            No nag notifications during these hours.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
                Start (no nags after)
              </label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="w-full bg-zinc-900 border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
                End (nags resume)
              </label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="w-full bg-zinc-900 border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Region & Timezone */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <Clock weight="bold" />
            <h2 className="font-loud text-xl headline uppercase">
              Region & Timezone
            </h2>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Country (sets currency & phone code)
            </label>
            <select
              value={userCountry}
              onChange={(e) => setUserCountry(e.target.value)}
              className="w-full bg-zinc-900 border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.currencySymbol} ({c.currency})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-zinc-900 border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Subscription */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="font-loud text-xl headline text-white uppercase mb-2">
            Plan
          </h2>
          <p className="text-zinc-400 font-medium capitalize">
            {profile.subscription_status === "pro_annual"
              ? "Pro Annual"
              : profile.subscription_status}
          </p>
          {profile.subscription_status === "free" && (
            <p className="text-sm text-nag-orange mt-2 font-semibold">
              {process.env.NEXT_PUBLIC_PAYMENTS_LIVE === "true"
                ? "Upgrade to Pro for unlimited leads — $10/mo"
                : "Pro plan coming soon — unlimited leads"}
            </p>
          )}
        </section>

        {/* Email Intake */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <EnvelopeSimple weight="bold" />
            <h2 className="font-loud text-xl headline uppercase">
              Auto-Add Leads via Email
            </h2>
          </div>
          <p className="text-sm text-zinc-500 -mt-2">
            Forward lead emails to this address and they&apos;ll automatically appear in your inbox.
          </p>

          <div className="flex items-center gap-2 bg-black border-2 border-zinc-700 rounded px-4 py-3">
            <code className="flex-1 text-nag-orange text-sm font-medium break-all">
              {intakeEmail}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(intakeEmail);
                setCopiedIntake(true);
                setTimeout(() => setCopiedIntake(false), 2000);
              }}
              className="shrink-0 text-zinc-400 hover:text-white transition-colors"
              title="Copy"
            >
              {copiedIntake ? (
                <span className="text-green-400 text-xs font-bold">Copied!</span>
              ) : (
                <Copy weight="bold" />
              )}
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <p className="text-sm text-zinc-400 font-semibold px-4 pt-4 pb-2">
              Setup guides
            </p>

            {[
              {
                id: "gmail",
                name: "Gmail",
                steps: [
                  "Open Gmail Settings (gear icon) → See all settings",
                  "Go to the \"Forwarding and POP/IMAP\" tab",
                  "Click \"Add a forwarding address\"",
                  `Paste: ${intakeEmail}`,
                  "Gmail will send a confirmation — check your NagLead inbox for the verification code",
                  "Once verified, create a filter: From contains your lead sources (e.g. your website form, Yelp, etc.)",
                  "Set the filter action to \"Forward it to\" your NagLead address",
                ],
              },
              {
                id: "outlook",
                name: "Outlook / Microsoft 365",
                steps: [
                  "Go to Settings → Mail → Rules",
                  "Click \"Add new rule\"",
                  "Name it \"Forward leads to NagLead\"",
                  "Set condition: e.g. \"From contains\" your lead source domains",
                  `Set action: \"Forward to\" → paste ${intakeEmail}`,
                  "Save the rule",
                ],
              },
              {
                id: "iphone",
                name: "iPhone / iOS Mail",
                steps: [
                  "iOS Mail doesn't support auto-forwarding rules",
                  "When you get a lead email, tap the Share/Forward button",
                  `Forward it to: ${intakeEmail}`,
                  "For automatic forwarding, set up a rule in your email provider (Gmail, Outlook, etc.) instead",
                ],
              },
              {
                id: "yahoo",
                name: "Yahoo Mail",
                steps: [
                  "Go to Settings → More Settings → Mailboxes",
                  "Select your email address",
                  `Under \"Forwarding\", enter: ${intakeEmail}`,
                  "Click Verify and follow the confirmation steps",
                  "Optionally create a filter to only forward lead emails",
                ],
              },
              {
                id: "manual",
                name: "Any email (manual forward)",
                steps: [
                  "Open any email that contains a lead",
                  "Tap Forward",
                  `Send to: ${intakeEmail}`,
                  "NagLead will automatically extract the name, phone, email, and what they need",
                  "The lead appears in your inbox within seconds",
                ],
              },
            ].map((guide) => (
              <div key={guide.id} className="border-t border-zinc-800">
                <button
                  onClick={() =>
                    setExpandedGuide(expandedGuide === guide.id ? null : guide.id)
                  }
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="text-sm text-white font-medium">
                    {guide.name}
                  </span>
                  {expandedGuide === guide.id ? (
                    <CaretUp weight="bold" className="text-zinc-500" />
                  ) : (
                    <CaretDown weight="bold" className="text-zinc-500" />
                  )}
                </button>
                {expandedGuide === guide.id && (
                  <ol className="px-4 pb-4 space-y-2">
                    {guide.steps.map((step, i) => (
                      <li
                        key={i}
                        className="text-sm text-zinc-400 flex gap-2"
                      >
                        <span className="text-zinc-600 font-bold shrink-0">
                          {i + 1}.
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-nag-orange text-black font-loud text-2xl headline py-3 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
        >
          {saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE SETTINGS"}
        </button>

        {/* Data Export */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <DownloadSimple weight="bold" />
            <h2 className="font-loud text-xl headline uppercase">Your Data</h2>
          </div>
          <button
            onClick={async () => {
              const { data: leads } = await supabase
                .from("leads")
                .select("*")
                .order("created_at", { ascending: false });
              if (leads && leads.length > 0) {
                const csv = leadsToCSV(leads);
                const date = new Date().toISOString().split("T")[0];
                downloadCSV(csv, `naglead-export-${date}.csv`);
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold py-3 rounded-lg hover:text-white hover:border-zinc-600 transition-colors"
          >
            <DownloadSimple weight="bold" />
            Export All Leads (CSV)
          </button>
          <p className="text-zinc-600 text-xs">
            Download all your leads as a CSV file. Your data belongs to you.
          </p>
        </section>

        {/* Danger Zone */}
        <div className="border-t border-zinc-800 pt-8 space-y-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold py-3 rounded-lg hover:text-white hover:border-zinc-600 transition-colors"
          >
            <SignOut weight="bold" />
            Sign Out
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-red-900/50 text-red-400 font-semibold py-3 rounded-lg hover:bg-red-950 hover:border-red-800 transition-colors"
          >
            <Trash weight="bold" />
            Delete Account
          </button>
        </div>
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-nag-zinc border-2 border-red-600 rounded-2xl p-8 max-w-sm mx-4">
            <h3 className="font-loud text-2xl headline text-red-400 mb-2">
              DELETE ACCOUNT?
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              This will permanently delete your account, all your leads, and all
              history. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-zinc-800 text-zinc-300 font-semibold py-3 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  const res = await fetch("/api/account/delete", {
                    method: "POST",
                  });
                  if (res.ok) {
                    await supabase.auth.signOut();
                    router.push("/");
                  } else {
                    setDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
