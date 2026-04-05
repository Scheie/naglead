"use client";

import { useMemo } from "react";
import type { Lead } from "@/lib/database.types";
import { X } from "@phosphor-icons/react";
import { formatMoney } from "@/lib/country-codes";

interface MonthlyScorecardProps {
  leads: Lead[];
  country: string;
  onClose: () => void;
}

export function MonthlyScorecard({ leads, country, onClose }: MonthlyScorecardProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const thisMonth = leads.filter(
      (l) => new Date(l.created_at) >= monthStart
    );
    const won = leads.filter(
      (l) => l.state === "won" && l.closed_at && new Date(l.closed_at) >= monthStart
    );
    const lost = leads.filter(
      (l) => l.state === "lost" && l.closed_at && new Date(l.closed_at) >= monthStart
    );
    const active = leads.filter(
      (l) => l.state === "reply_now" || l.state === "waiting"
    );
    const revenue = won.reduce((sum, l) => sum + (l.value_cents ?? 0), 0);

    const closed = won.length + lost.length;
    const winRate = closed > 0 ? Math.round((won.length / closed) * 100) : 0;

    // Average reply time
    const replied = thisMonth.filter((l) => l.replied_at);
    const avgReplyMs =
      replied.length > 0
        ? replied.reduce(
            (sum, l) =>
              sum +
              (new Date(l.replied_at!).getTime() -
                new Date(l.created_at).getTime()),
            0
          ) / replied.length
        : 0;
    const avgReplyHrs = avgReplyMs > 0 ? (avgReplyMs / 3600000).toFixed(1) : "--";

    const followUpRate =
      thisMonth.length > 0
        ? Math.round((replied.length / thisMonth.length) * 100)
        : 0;

    return {
      monthName,
      newLeads: thisMonth.length,
      won: won.length,
      lost: lost.length,
      active: active.length,
      revenue,
      winRate,
      avgReplyHrs,
      followUpRate,
    };
  }, [leads]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="scorecard-title" className="relative w-full max-w-sm bg-nag-zinc border-t-4 sm:border-4 border-zinc-700 rounded-t-2xl sm:rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 id="scorecard-title" className="font-loud text-3xl headline text-white uppercase">
            {stats.monthName}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X weight="bold" />
          </button>
        </div>

        <div className="space-y-4">
          <StatRow label="New leads" value={String(stats.newLeads)} />
          <StatRow
            label="Won"
            value={`${stats.won}`}
            extra={
              stats.revenue > 0
                ? `(${formatMoney(stats.revenue, country)})`
                : undefined
            }
            color="text-green-400"
          />
          <StatRow label="Lost" value={String(stats.lost)} color="text-zinc-400" />
          <StatRow label="Still active" value={String(stats.active)} />

          <div className="border-t border-zinc-700 pt-4 space-y-4">
            <StatRow
              label="Win rate"
              value={`${stats.winRate}%`}
              color={stats.winRate >= 50 ? "text-green-400" : "text-nag-yellow"}
            />
            <StatRow
              label="Avg reply time"
              value={`${stats.avgReplyHrs} hrs`}
            />
            <StatRow
              label="Follow-up rate"
              value={`${stats.followUpRate}%`}
              color={
                stats.followUpRate >= 80 ? "text-green-400" : "text-nag-orange"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  extra,
  color,
}: {
  label: string;
  value: string;
  extra?: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-zinc-400 font-medium">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`font-loud text-2xl headline ${color ?? "text-white"}`}>
          {value}
        </span>
        {extra && <span className={`text-sm font-medium ${color ?? "text-zinc-400"}`}>{extra}</span>}
      </div>
    </div>
  );
}
