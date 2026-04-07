"use client";

import { useState } from "react";
import type { Lead } from "@/lib/database.types";
import {
  Phone,
  ChatText,
  EnvelopeSimple,
  Check,
  Clock,
  X,
  WarningCircle,
} from "@phosphor-icons/react";
import { LeadHistory } from "./LeadHistory";

interface LeadCardProps {
  lead: Lead;
  compact?: boolean;
  currencySymbol?: string;
  onMarkDone: (valueCents?: number) => void;
  onSnooze: () => void;
  onMarkLost: (reason?: string) => void;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function urgencyLevel(createdAt: string): "low" | "medium" | "high" | "critical" {
  const hours = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  if (hours < 2) return "low";
  if (hours < 6) return "medium";
  if (hours < 24) return "high";
  return "critical";
}

const urgencyStyles = {
  low: "border-zinc-800",
  medium: "border-nag-yellow/30",
  high: "border-nag-orange/50",
  critical: "border-red-600",
};

export function LeadCard({
  lead,
  compact,
  currencySymbol = "$",
  onMarkDone,
  onSnooze,
  onMarkLost,
}: LeadCardProps) {
  const [showLostReasons, setShowLostReasons] = useState(false);
  const [showValueInput, setShowValueInput] = useState(false);
  const [valueInput, setValueInput] = useState("");

  const urgency =
    lead.state === "reply_now" ? urgencyLevel(lead.created_at) : "low";
  const age = timeAgo(
    lead.state === "waiting" && lead.replied_at
      ? lead.replied_at
      : lead.created_at
  );

  if (compact) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-white truncate block">
              {lead.name}
            </span>
            <span className="text-zinc-500 text-xs truncate block">
              {lead.description}
            </span>
          </div>
          <span className="text-zinc-500 text-xs font-medium whitespace-nowrap">
            {age}
          </span>
        </div>
        <div className="flex gap-1 mt-2">
          {showValueInput ? (
            <form
              className="flex items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                onMarkDone(
                  valueInput ? Math.round(parseFloat(valueInput) * 100) : undefined
                );
              }}
            >
              <span className="text-zinc-400 text-sm">{currencySymbol}</span>
              <input
                type="number"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                className="w-20 bg-black border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                placeholder="value"
                autoFocus
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold"
              >
                WON
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowValueInput(true)}
              className="px-2 py-1 rounded bg-green-900/50 text-green-400 text-xs font-bold hover:bg-green-800 transition-colors"
            >
              WON
            </button>
          )}
          <button
            onClick={() => onMarkLost()}
            className="px-2 py-1 rounded bg-zinc-800 text-zinc-400 text-xs font-bold hover:bg-zinc-700 transition-colors"
          >
            LOST
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-zinc-900 border ${urgencyStyles[urgency]} rounded-xl p-4 shadow-lg transition-colors ${
        urgency === "critical" ? "animate-urgent" : ""
      }`}
    >
      {/* Header row */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white text-lg">{lead.name}</h3>
            {urgency === "critical" && (
              <WarningCircle weight="fill" className="text-red-500" />
            )}
            {urgency === "high" && (
              <WarningCircle weight="fill" className="text-nag-orange" />
            )}
          </div>
          <p className="text-zinc-400 text-sm">{lead.description}</p>
        </div>
        <span
          className={`text-xs font-bold uppercase whitespace-nowrap ${
            urgency === "critical"
              ? "text-red-400"
              : urgency === "high"
                ? "text-nag-orange"
                : urgency === "medium"
                  ? "text-nag-yellow"
                  : "text-zinc-500"
          }`}
        >
          {age} ago
        </span>
      </div>

      {/* Contact info */}
      {(lead.phone || lead.email) && (
        <p className="text-zinc-500 text-sm mb-3">
          {lead.phone && <span>📞 {lead.phone}</span>}
          {lead.phone && lead.email && <span className="mx-2">·</span>}
          {lead.email && <span>📧 {lead.email}</span>}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm font-semibold transition-colors border border-zinc-700"
          >
            <Phone weight="bold" className="text-sm" />
            Call
          </a>
        )}
        {lead.phone && (
          <a
            href={`sms:${lead.phone}`}
            className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm font-semibold transition-colors border border-zinc-700"
          >
            <ChatText weight="bold" className="text-sm" />
            Text
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm font-semibold transition-colors border border-zinc-700"
          >
            <EnvelopeSimple weight="bold" className="text-sm" />
            Email
          </a>
        )}

        <button
          onClick={() => onMarkDone()}
          className="flex items-center gap-1 px-3 py-2 bg-green-900/50 hover:bg-green-800 text-green-400 rounded-md text-sm font-bold transition-colors border border-green-800/50"
        >
          <Check weight="bold" />
          Done
        </button>

        <button
          onClick={onSnooze}
          className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-sm font-semibold transition-colors border border-zinc-700"
        >
          <Clock weight="bold" />
          Snooze
        </button>

        {showLostReasons ? (
          <div className="flex gap-1 flex-wrap">
            {["Competitor", "No budget", "No response", "Other"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  onMarkLost(r);
                  setShowLostReasons(false);
                }}
                className="px-2 py-1 bg-red-950 text-red-400 rounded text-xs font-bold hover:bg-red-900 transition-colors border border-red-800/50"
              >
                {r}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setShowLostReasons(true)}
            className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-500 rounded-md text-sm font-semibold transition-colors border border-zinc-700"
          >
            <X weight="bold" />
            Lost
          </button>
        )}
      </div>

      <LeadHistory leadId={lead.id} />
    </div>
  );
}
