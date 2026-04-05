"use client";

import { Warning } from "@phosphor-icons/react";

const losses = [
  "$850 (FORGOT TO CALL BACK)",
  "$1200 (WENT WITH COMPETITOR)",
  "$400 (DIED IN INBOX)",
  "$3500 (POST-IT NOTE FELL BEHIND DESK)",
];

export function LostRevenueTicker() {
  const items = [...losses, ...losses, ...losses];

  return (
    <div className="w-full bg-nag-orange py-3 overflow-hidden border-y-4 border-black border-dashed relative z-20 shadow-[0_10px_30px_rgba(255,69,0,0.3)]">
      <div className="flex whitespace-nowrap animate-marquee font-loud text-2xl headline text-black">
        {items.map((loss, i) => (
          <span key={i} className="mx-4">
            {i % losses.length === 0 ? (
              <>
                WARNING <Warning weight="bold" className="inline" />
              </>
            ) : (
              <>LOST LEAD: {loss} &bull;</>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
