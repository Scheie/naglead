"use client";

import { X, Clock } from "@phosphor-icons/react";

interface SnoozeModalProps {
  leadName: string;
  onSnooze: (until: Date) => void;
  onClose: () => void;
}

const snoozeOptions = [
  {
    label: "1 hour",
    getDate: () => new Date(Date.now() + 60 * 60 * 1000),
  },
  {
    label: "Tomorrow morning",
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(8, 0, 0, 0);
      return d;
    },
  },
  {
    label: "3 days",
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
  {
    label: "1 week",
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
];

export function SnoozeModal({ leadName, onSnooze, onClose }: SnoozeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="snooze-title" className="relative w-full max-w-sm bg-nag-zinc border-t-4 sm:border-4 border-zinc-700 rounded-t-2xl sm:rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 id="snooze-title" className="font-loud text-3xl headline text-white flex items-center gap-2">
              <Clock weight="bold" className="text-zinc-400" />
              SNOOZE
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Remind me about {leadName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X weight="bold" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {snoozeOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => onSnooze(option.getDate())}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-3 px-4 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-nag-orange"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
