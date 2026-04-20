"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "@phosphor-icons/react";
import { requestPermission, getPermissionState } from "@/lib/notifications";

export function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const state = getPermissionState();
    if (state === "default") {
      // Show after a brief delay so it's not jarring
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="bg-nag-orange/10 border-2 border-nag-orange rounded-xl p-4 flex items-start gap-4">
      <div className="w-10 h-10 bg-nag-orange rounded-full flex items-center justify-center shrink-0">
        <Bell weight="bold" className="text-black text-xl" />
      </div>
      <div className="flex-1">
        <p className="text-white font-bold text-sm">
          Enable notifications. This is how NagLead works
        </p>
        <p className="text-zinc-400 text-xs mt-1">
          We need permission to nag you. That&apos;s literally our entire job.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={async () => {
              await requestPermission();
              setShow(false);
            }}
            className="bg-nag-orange text-black font-bold text-xs px-4 py-2 rounded-sm hover:bg-nag-orange-dark transition-colors"
          >
            ENABLE NOTIFICATIONS
          </button>
          <button
            onClick={() => setShow(false)}
            className="text-zinc-500 text-xs font-medium px-2 py-2 hover:text-white transition-colors"
          >
            Later
          </button>
        </div>
      </div>
      <button
        onClick={() => setShow(false)}
        className="text-zinc-500 hover:text-white transition-colors shrink-0"
      >
        <X weight="bold" />
      </button>
    </div>
  );
}
