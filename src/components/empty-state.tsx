"use client";

import { SearchX } from "lucide-react";

interface EmptyStateProps {
  onSuggestion?: (text: string) => void;
}

const SUGGESTIONS = [
  { label: "Remote React jobs", text: "Remote React jobs" },
  { label: "SaaS fintech startups", text: "SaaS fintech startups" },
  { label: "AI automation opportunities", text: "AI automation opportunities" },
];

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 py-12 text-center shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <SearchX className="size-7" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        No matches found
      </h3>
      <p className="mx-auto mt-1 max-w-md px-6 text-sm leading-relaxed text-slate-600">
        Try broadening your location, simplifying your request, or switching
        modes.
      </p>

      {onSuggestion && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 px-6">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => onSuggestion(s.text)}
              className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all duration-150 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:bg-indigo-100"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
