export interface WeeklyStats {
  newLeads: number;
  won: number;
  lost: number;
  replyNow: number;
  waiting: number;
  revenueCents: number;
}

export function buildSummaryMessage(stats: WeeklyStats): { title: string; body: string } {
  const lines: string[] = [];

  if (stats.newLeads > 0) {
    lines.push(`${stats.newLeads} new lead${stats.newLeads === 1 ? "" : "s"}`);
  }
  if (stats.won > 0) {
    const rev = stats.revenueCents > 0 ? ` ($${(stats.revenueCents / 100).toLocaleString()})` : "";
    lines.push(`${stats.won} won${rev} 🎉`);
  }
  if (stats.lost > 0) {
    lines.push(`${stats.lost} lost`);
  }

  const active = stats.replyNow + stats.waiting;
  if (active > 0) {
    const parts: string[] = [];
    if (stats.replyNow > 0) parts.push(`${stats.replyNow} need a reply`);
    if (stats.waiting > 0) parts.push(`${stats.waiting} waiting`);
    lines.push(parts.join(", "));
  }

  if (lines.length === 0) {
    return {
      title: "Weekly summary",
      body: "Quiet week — no lead activity. Time to drum up some business? 💪",
    };
  }

  let nudge = "";
  if (stats.replyNow > 0) {
    nudge = ` — ${stats.replyNow} still waiting on you!`;
  } else if (stats.won > 0 && stats.lost === 0) {
    nudge = " — perfect week! 🔥";
  }

  return {
    title: "Your week in leads",
    body: lines.join(" · ") + nudge,
  };
}
