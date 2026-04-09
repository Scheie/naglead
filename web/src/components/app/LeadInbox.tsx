"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Lead } from "@/lib/database.types";
import { LeadCard } from "./LeadCard";
import { AddLeadModal } from "./AddLeadModal";
import { SnoozeModal } from "./SnoozeModal";
import { MonthlyScorecard } from "./MonthlyScorecard";
import { UpgradePrompt } from "./UpgradePrompt";
import { NagEngine } from "./NagEngine";
import { NotificationPrompt } from "./NotificationPrompt";
import { AppHeader } from "./AppHeader";
import { useToast } from "./Toast";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, getCurrencySymbol } from "@/lib/country-codes";

const FREE_LEAD_LIMIT = 5;

interface LeadInboxProps {
  initialLeads: Lead[];
  userId: string;
  userName: string;
  subscriptionStatus: string;
  country: string;
}

export function LeadInbox({ initialLeads, userId, userName, subscriptionStatus, country }: LeadInboxProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [showAddLead, setShowAddLead] = useState(false);
  const [snoozeTarget, setSnoozeTarget] = useState<Lead | null>(null);
  const [showSnoozed, setShowSnoozed] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    pendingLead: { name: string; description: string; phone: string; email: string };
    existingName: string;
  } | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const isFree = subscriptionStatus === "free";
  const activeLeadCount = leads.filter(
    (l) => l.state === "reply_now" || l.state === "waiting"
  ).length;
  const atFreeLimit = isFree && activeLeadCount >= FREE_LEAD_LIMIT;

  async function logEvent(leadId: string, eventType: string, metadata?: Record<string, unknown>) {
    await supabase.from("lead_events").insert({
      lead_id: leadId,
      user_id: userId,
      event_type: eventType,
      metadata: metadata ?? null,
    });
  }

  const refreshLeads = useCallback(async () => {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLeads(data);
  }, [supabase]);

  // Auto-refresh when leads change in the database
  useEffect(() => {
    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads", filter: `user_id=eq.${userId}` },
        () => { refreshLeads(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, userId, refreshLeads]);

  const replyNow = useMemo(
    () =>
      leads
        .filter(
          (l) =>
            l.state === "reply_now" &&
            (!l.snoozed_until || new Date(l.snoozed_until) <= new Date())
        )
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
    [leads]
  );

  const snoozed = useMemo(
    () =>
      leads
        .filter(
          (l) =>
            l.state === "reply_now" &&
            l.snoozed_until &&
            new Date(l.snoozed_until) > new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.snoozed_until!).getTime() - new Date(b.snoozed_until!).getTime()
        ),
    [leads]
  );

  const waiting = useMemo(
    () =>
      leads
        .filter((l) => l.state === "waiting")
        .sort(
          (a, b) =>
            new Date(a.updated_at).getTime() -
            new Date(b.updated_at).getTime()
        ),
    [leads]
  );

  const wonThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return leads.filter(
      (l) =>
        l.state === "won" &&
        l.closed_at &&
        new Date(l.closed_at) >= monthStart
    );
  }, [leads]);

  const lostThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return leads.filter(
      (l) =>
        l.state === "lost" &&
        l.closed_at &&
        new Date(l.closed_at) >= monthStart
    );
  }, [leads]);

  const wonRevenue = wonThisMonth.reduce(
    (sum, l) => sum + (l.value_cents ?? 0),
    0
  );

  async function addLead(lead: {
    name: string;
    description: string;
    phone: string;
    email: string;
  }, skipDedupCheck = false) {
    // Check for duplicates before creating
    if (!skipDedupCheck) {
      const query = supabase
        .from("leads")
        .select("id, name")
        .eq("user_id", userId)
        .in("state", ["reply_now", "waiting"]);

      if (lead.email) {
        query.eq("email", lead.email);
      } else {
        query.eq("name", lead.name);
      }

      const { data: existing } = await query.limit(1);

      if (existing && existing.length > 0) {
        setShowAddLead(false);
        setDuplicateWarning({ pendingLead: lead, existingName: existing[0].name });
        return;
      }
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        user_id: userId,
        name: lead.name,
        description: lead.description,
        phone: lead.phone || null,
        email: lead.email || null,
        state: "reply_now",
        source: "manual",
      })
      .select()
      .single();

    if (error) {
      toast(error.message?.includes("Free tier") ? "Free tier limit reached — upgrade to Pro!" : "Failed to add lead", "error");
      return;
    }
    if (data) {
      logEvent(data.id, "created", { source: "manual" });
      setLeads((prev) => [data, ...prev]);
      setShowAddLead(false);
      setDuplicateWarning(null);
      toast(`${lead.name} added — now follow up!`);
    }
  }

  async function markReplied(leadId: string) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("leads")
      .update({ state: "waiting", replied_at: now, updated_at: now })
      .eq("id", leadId);

    if (error) { toast("Failed to update lead", "error"); return; }
    logEvent(leadId, "replied");
    const lead = leads.find((l) => l.id === leadId);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, state: "waiting" as const, replied_at: now, updated_at: now }
          : l
      )
    );
    toast(`${lead?.name ?? "Lead"} moved to Waiting`);
  }

  async function markWon(leadId: string, valueCents?: number) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("leads")
      .update({
        state: "won",
        closed_at: now,
        updated_at: now,
        value_cents: valueCents ?? null,
      })
      .eq("id", leadId);

    if (error) { toast("Failed to update lead", "error"); return; }
    logEvent(leadId, "won", valueCents ? { value_cents: valueCents } : undefined);
    const lead = leads.find((l) => l.id === leadId);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              state: "won" as const,
              closed_at: now,
              updated_at: now,
              value_cents: valueCents ?? null,
            }
          : l
      )
    );
    const valueStr = valueCents ? ` (${formatMoney(valueCents, country)})` : "";
    toast(`${lead?.name ?? "Lead"} won!${valueStr}`);
  }

  async function markLost(leadId: string, reason?: string) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("leads")
      .update({
        state: "lost",
        closed_at: now,
        updated_at: now,
        lost_reason: reason ?? null,
      })
      .eq("id", leadId);

    if (error) { toast("Failed to update lead", "error"); return; }
    logEvent(leadId, "lost", reason ? { reason } : undefined);
    const lead = leads.find((l) => l.id === leadId);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              state: "lost" as const,
              closed_at: now,
              updated_at: now,
              lost_reason: reason ?? null,
            }
          : l
      )
    );
    toast(`${lead?.name ?? "Lead"} marked as lost`, "info");
  }

  async function snoozeLead(leadId: string, until: Date) {
    const { error } = await supabase
      .from("leads")
      .update({ snoozed_until: until.toISOString() })
      .eq("id", leadId);

    if (error) { toast("Failed to snooze lead", "error"); return; }
    logEvent(leadId, "snoozed", { until: until.toISOString() });
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, snoozed_until: until.toISOString() }
          : l
      )
    );
    setSnoozeTarget(null);
    toast(`Snoozed — we'll remind you later`);
  }

  async function unsnoozeLead(leadId: string) {
    const { error } = await supabase
      .from("leads")
      .update({ snoozed_until: null })
      .eq("id", leadId);

    if (error) { toast("Failed to unsnooze lead", "error"); return; }
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, snoozed_until: null } : l
      )
    );
    toast("Lead moved back to Reply Now");
  }

  function snoozedUntilLabel(until: string): string {
    const diff = new Date(until).getTime() - Date.now();
    if (diff <= 0) return "expiring...";
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.ceil(diff / 60000)}m left`;
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <AppHeader
        userName={userName}
        onAddLead={() => { atFreeLimit ? setShowUpgrade(true) : setShowAddLead(true); }}
      />

      <NagEngine leads={leads} userId={userId} onLeadsUpdated={refreshLeads} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-8">
        <NotificationPrompt />

        {leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-zinc-900 border-2 border-zinc-700 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">📢</span>
            </div>
            <h2 className="font-loud text-3xl headline text-white mb-2">
              NO LEADS YET
            </h2>
            <p className="text-zinc-400 font-medium max-w-sm mb-6">
              Add your first lead and we&apos;ll make sure you never forget to follow up.
            </p>
            <button
              onClick={() => setShowAddLead(true)}
              className="bg-nag-orange text-black font-loud text-2xl headline px-8 py-3 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              + ADD YOUR FIRST LEAD
            </button>
          </div>
        )}

        {isFree && activeLeadCount >= FREE_LEAD_LIMIT - 1 && (
          <button
            onClick={() => setShowUpgrade(true)}
            className={`w-full rounded-xl p-4 text-left transition-colors ${
              atFreeLimit
                ? "bg-nag-orange/10 border-2 border-nag-orange text-nag-orange"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <p className="font-bold text-sm">
              {atFreeLimit
                ? `You've hit the ${FREE_LEAD_LIMIT}-lead limit. Upgrade to Pro for unlimited leads.`
                : `${activeLeadCount}/${FREE_LEAD_LIMIT} active leads used. Upgrade to Pro for unlimited.`}
            </p>
            <p className="text-xs mt-1 opacity-70">
              {process.env.NEXT_PUBLIC_PAYMENTS_LIVE === "true"
                ? "$10/month — one saved job pays for 5 years of NagLead"
                : "Pro plans coming soon — mark leads as won/lost to free up slots"}
            </p>
          </button>
        )}

        {leads.length > 0 && (
          <>
            {/* Reply Now Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <h2 className="font-loud text-3xl headline text-red-400">
                  REPLY NOW ({replyNow.length})
                </h2>
              </div>
              {replyNow.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-zinc-500 font-medium">
                    No leads waiting for a reply. Nice work!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {replyNow.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      currencySymbol={getCurrencySymbol(country)}
                      onMarkDone={() => markReplied(lead.id)}
                      onSnooze={() => setSnoozeTarget(lead)}
                      onMarkLost={(reason) => markLost(lead.id, reason)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Snoozed Section */}
            {snoozed.length > 0 && (
              <section>
                <button
                  onClick={() => setShowSnoozed(!showSnoozed)}
                  className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors"
                >
                  <span className="text-sm font-semibold text-zinc-500">
                    😴 {snoozed.length} snoozed
                  </span>
                  <span className="text-zinc-500">{showSnoozed ? "⌄" : "›"}</span>
                </button>
                {showSnoozed && (
                  <div className="mt-2 space-y-2">
                    {snoozed.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-zinc-400">{lead.name}</p>
                          <p className="text-xs text-zinc-600">{snoozedUntilLabel(lead.snoozed_until!)}</p>
                        </div>
                        <button
                          onClick={() => unsnoozeLead(lead.id)}
                          className="text-xs font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-md hover:bg-zinc-700 transition-colors"
                        >
                          Wake up
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Waiting Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <h2 className="font-loud text-3xl headline text-yellow-400">
                  WAITING ({waiting.length})
                </h2>
              </div>
              {waiting.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-zinc-500 text-sm font-medium">
                    No leads waiting on responses.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {waiting.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      compact
                      currencySymbol={getCurrencySymbol(country)}
                      onMarkDone={(value) => markWon(lead.id, value)}
                      onSnooze={() => setSnoozeTarget(lead)}
                      onMarkLost={(reason) => markLost(lead.id, reason)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Won / Lost Summary */}
            <section className="flex gap-4">
          <button
            onClick={() => setShowScorecard(true)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-green-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-bold text-green-400 uppercase">
                Won this month
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-loud text-3xl headline text-white">
                {wonThisMonth.length}
              </span>
              {wonRevenue > 0 && (
                <span className="text-green-400 font-semibold text-sm">
                  {formatMoney(wonRevenue, country)}
                </span>
              )}
            </div>
          </button>
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <span className="text-sm font-bold text-zinc-500 uppercase">
                Lost this month
              </span>
            </div>
            <span className="font-loud text-3xl headline text-zinc-400">
              {lostThisMonth.length}
            </span>
          </div>
            </section>
          </>
        )}
      </main>

      {showAddLead && (
        <AddLeadModal
          onAdd={addLead}
          onClose={() => setShowAddLead(false)}
        />
      )}

      {snoozeTarget && (
        <SnoozeModal
          leadName={snoozeTarget.name}
          onSnooze={(until) => snoozeLead(snoozeTarget.id, until)}
          onClose={() => setSnoozeTarget(null)}
        />
      )}

      {showScorecard && (
        <MonthlyScorecard
          leads={leads}
          country={country}
          onClose={() => setShowScorecard(false)}
        />
      )}

      {showUpgrade && (
        <UpgradePrompt
          activeCount={activeLeadCount}
          limit={FREE_LEAD_LIMIT}
          onClose={() => setShowUpgrade(false)}
        />
      )}

      {duplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setDuplicateWarning(null)}
          />
          <div className="relative w-full max-w-sm bg-nag-zinc border-t-4 sm:border-4 border-nag-yellow rounded-t-2xl sm:rounded-2xl p-6">
            <h3 className="font-loud text-2xl headline text-nag-yellow mb-2">
              POSSIBLE DUPLICATE
            </h3>
            <p className="text-zinc-400 text-sm mb-1">
              You already have an active lead called{" "}
              <span className="text-white font-semibold">
                &quot;{duplicateWarning.existingName}&quot;
              </span>
            </p>
            <p className="text-zinc-500 text-sm mb-6">
              Add <span className="text-white">&quot;{duplicateWarning.pendingLead.name}&quot;</span> anyway?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDuplicateWarning(null)}
                className="flex-1 bg-zinc-800 text-zinc-300 font-semibold py-3 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => addLead(duplicateWarning.pendingLead, true)}
                className="flex-1 bg-nag-orange text-black font-loud text-xl headline py-3 rounded-sm shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                ADD ANYWAY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
