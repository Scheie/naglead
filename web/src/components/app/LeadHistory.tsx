"use client";

import { useState } from "react";
import { ClockCounterClockwise, CaretDown, CaretUp } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import type { LeadEvent } from "@/lib/database.types";

const EVENT_LABELS: Record<string, { label: string; icon: string }> = {
  created: { label: "Lead created", icon: "+" },
  called: { label: "Called", icon: "📞" },
  texted: { label: "Texted", icon: "💬" },
  emailed: { label: "Emailed", icon: "📧" },
  replied: { label: "Replied", icon: "✓" },
  snoozed: { label: "Snoozed", icon: "⏸" },
  won: { label: "Won", icon: "🎉" },
  lost: { label: "Lost", icon: "✕" },
  nagged: { label: "Nagged", icon: "📢" },
};

function formatEventTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface LeadHistoryProps {
  leadId: string;
  createdAt: string;
}

export function LeadHistory({ leadId, createdAt }: LeadHistoryProps) {
  const [events, setEvents] = useState<LeadEvent[] | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }

    if (!events) {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("lead_events")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      const events = data ?? [];
      // Always show at least a "created" entry
      if (events.length === 0) {
        events.push({
          id: "fallback-created",
          lead_id: leadId,
          user_id: "",
          event_type: "created",
          metadata: null,
          created_at: createdAt,
        });
      }
      setEvents(events);
      setLoading(false);
    }

    setOpen(true);
  }

  return (
    <div className="mt-3 border-t border-zinc-800 pt-2">
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-medium"
      >
        <ClockCounterClockwise weight="bold" className="text-sm" />
        History
        {open ? <CaretUp weight="bold" /> : <CaretDown weight="bold" />}
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          {loading ? (
            <div className="flex gap-2 py-2">
              <div className="w-full h-4 bg-zinc-800 rounded animate-pulse" />
            </div>
          ) : events && events.length > 0 ? (
            events.map((event) => {
              const info = EVENT_LABELS[event.event_type] ?? {
                label: event.event_type,
                icon: "•",
              };
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-2 text-xs py-1"
                >
                  <span className="w-5 text-center">{info.icon}</span>
                  <span className="text-zinc-400">{info.label}</span>
                  <span className="text-zinc-600 ml-auto">
                    {formatEventTime(event.created_at)}
                  </span>
                </div>
              );
            })
          ) : null}
        </div>
      )}
    </div>
  );
}
