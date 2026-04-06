export interface NagScheduleEntry {
  minAge: number;
  title: string;
  body: (name: string, desc: string) => string;
}

export const REPLY_NOW_SCHEDULE: NagScheduleEntry[] = [
  {
    minAge: 2 * 60 * 60 * 1000,
    title: "New lead waiting",
    body: (name, desc) => `📱 ${name} needs ${desc} — send a quick reply`,
  },
  {
    minAge: 6 * 60 * 60 * 1000,
    title: "Lead going cold",
    body: (name, desc) => `⏰ ${name} has been waiting 6 hours for a reply about ${desc}`,
  },
  {
    minAge: 24 * 60 * 60 * 1000,
    title: "1 day with no reply",
    body: (name, desc) => `⚠️ ${name} — 1 day with no reply. This lead is going cold`,
  },
  {
    minAge: 48 * 60 * 60 * 1000,
    title: "You're losing this job",
    body: (name, desc) => `🔴 ${name} has waited 2 days for ${desc}. Call now or lose it`,
  },
  {
    minAge: 72 * 60 * 60 * 1000,
    title: "Last chance",
    body: (name) => `❌ ${name} — 3 days, no reply. Mark as lost or call right now`,
  },
];

export const WAITING_SCHEDULE: NagScheduleEntry[] = [
  {
    minAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    title: "Quick check-in?",
    body: (name, desc) => `🔄 Quick check-in with ${name} about ${desc}?`,
  },
  {
    minAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    title: "Still waiting",
    body: (name, desc) => `⏰ Still waiting on ${name} about ${desc}. Time to follow up`,
  },
  {
    minAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    title: "1 week silent",
    body: (name) => `⚠️ ${name} hasn't replied in a week. Send a check-in?`,
  },
  {
    minAge: 14 * 24 * 60 * 60 * 1000, // 2 weeks
    title: "2 weeks silent",
    body: (name) => `🔴 ${name} — 2 weeks silent. Follow up or mark as lost?`,
  },
  {
    minAge: 21 * 24 * 60 * 60 * 1000, // 3 weeks
    title: "Time to close this out",
    body: (name) => `❌ ${name} — 3 weeks with no reply. Mark as won or lost?`,
  },
];

export function isQuietHours(
  now: Date,
  timezone: string,
  quietStart: string,
  quietEnd: string
): boolean {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const userTime = formatter.format(now);
    const [h, m] = userTime.split(":").map(Number);
    const userMinutes = h * 60 + m;

    const [startH, startM] = quietStart.split(":").map(Number);
    const startMinutes = startH * 60 + startM;

    const [endH, endM] = quietEnd.split(":").map(Number);
    const endMinutes = endH * 60 + endM;

    if (startMinutes > endMinutes) {
      return userMinutes >= startMinutes || userMinutes < endMinutes;
    }
    return userMinutes >= startMinutes && userMinutes < endMinutes;
  } catch {
    return false;
  }
}

export function getNagMessage(
  state: string,
  ageMs: number,
  nagCount: number,
  name: string,
  description: string
): { title: string; body: string } | null {
  const schedule = state === "reply_now" ? REPLY_NOW_SCHEDULE : WAITING_SCHEDULE;

  let matched: NagScheduleEntry | null = null;
  for (const entry of schedule) {
    if (ageMs >= entry.minAge) {
      matched = entry;
    }
  }

  if (!matched) return null;

  const levelIndex = schedule.indexOf(matched);
  if (nagCount > levelIndex) return null;

  return {
    title: matched.title,
    body: matched.body(name, description),
  };
}
