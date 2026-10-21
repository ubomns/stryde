"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MESSAGES = [
  { threshold: 0, text: "Searching across sources…" },
  { threshold: 5000, text: "Curating results…" },
  { threshold: 10000, text: "Still searching, this can take a moment." },
];

export function LoadingState() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => clearInterval(id);
  }, []);

  const message =
    MESSAGES.slice()
      .reverse()
      .find((m) => elapsed >= m.threshold)?.text ?? MESSAGES[0].text;

  return (
    <div
      className="flex flex-col gap-8"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/3 animate-shimmer rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 motion-reduce:animate-none" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-900">{message}</p>
        <p className="mt-1 text-xs text-slate-500">
          Results usually appear within 10 seconds. You can leave this tab open.
        </p>
      </div>

      <div className="flex flex-col">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`py-6 ${i === 2 ? "" : "border-b border-slate-200/70"}`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
