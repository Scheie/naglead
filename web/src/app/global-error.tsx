"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ backgroundColor: "#000", color: "#fff", fontFamily: "sans-serif", padding: 40 }}>
        <h1>Something went wrong</h1>
        <p style={{ color: "#a1a1aa" }}>An unexpected error occurred. We&apos;ve been notified.</p>
        <button
          onClick={reset}
          style={{
            marginTop: 16,
            padding: "12px 24px",
            backgroundColor: "#FF4500",
            color: "#000",
            border: "none",
            borderRadius: 4,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
