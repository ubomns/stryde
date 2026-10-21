import { SearchResponse } from "@/lib/types";

interface ContextCardProps {
  response: Pick<SearchResponse, "intent_summary" | "assumptions" | "notes">;
}

export function ContextCard({ response }: ContextCardProps) {
  const hasContext =
    response.intent_summary ||
    (response.assumptions && response.assumptions.length > 0) ||
    response.notes;

  if (!hasContext) return null;

  return (
    <div className="rounded-2xl border border-indigo-100/70 bg-indigo-50/70 p-5 backdrop-blur-sm">
      {response.intent_summary && (
        <p className="text-sm leading-relaxed text-slate-800">
          <span className="font-semibold text-indigo-900">We understood:</span>{" "}
          {response.intent_summary}
        </p>
      )}

      {response.assumptions && response.assumptions.length > 0 && (
        <div className={response.intent_summary ? "mt-3" : undefined}>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-900/70">
            Assumptions
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-slate-700">
            {response.assumptions.map((assumption, i) => (
              <li key={`assumption-${i}-${assumption.slice(0, 32)}`}>
                {assumption}
              </li>
            ))}
          </ul>
        </div>
      )}

      {response.notes && (
        <div
          className={
            response.intent_summary || response.assumptions?.length
              ? "mt-3 rounded-xl border border-amber-200/70 bg-amber-50/70 p-3"
              : "rounded-xl border border-amber-200/70 bg-amber-50/70 p-3"
          }
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Note
          </p>
          <p className="mt-1 text-sm leading-relaxed text-amber-900">
            {response.notes}
          </p>
        </div>
      )}
    </div>
  );
}
