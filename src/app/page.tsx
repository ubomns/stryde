"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "cn";
import { SearchForm } from "@/components/search-form";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { ContextCard } from "@/components/context-card";
import { ResultCard } from "@/components/result-card";
import { SortControls } from "@/components/sort-controls";
import { MockBadge } from "@/components/mock-badge";
import { SearchRequest, SearchResponse } from "@/lib/types";
import { SortOption, sortLeads } from "@/lib/sort";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<{
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [sort, setSort] = useState<SortOption>("default");
  const [lastRequest, setLastRequest] = useState<SearchRequest | null>(null);
  const [prefillQuery, setPrefillQuery] = useState("");
  const [formKey, setFormKey] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const sortedLeads = useMemo(
    () => (response ? sortLeads(response.leads, sort) : []),
    [response, sort]
  );

  const handleSearch = useCallback(async (request: SearchRequest) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setHasSearched(true);
    setSort("default");
    setLastRequest(request);

    const delay = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    const execute = async (attempt: number): Promise<void> => {
      try {
        const res = await fetch("/api/v1/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
        setIsMock(res.headers.get("X-Mock-Data") === "true");

        const data:
          | SearchResponse
          | { error: { code: string; message: string; details?: Record<string, unknown> } } = await res
          .json()
          .catch(() => ({
            error: { code: "UNKNOWN_ERROR", message: "Invalid response." },
          }));

        if (!res.ok || "error" in data) {
          const err =
            "error" in data
              ? data.error
              : { code: "UNKNOWN_ERROR", message: "Something went wrong." };
          const status = res.status;
          const shouldRetry =
            attempt < 2 &&
            (status >= 500 || status === 0 || err.code === "TIMEOUT_ERROR");

          if (shouldRetry) {
            await delay(500 * attempt);
            return execute(attempt + 1);
          }

          setError({
            code: err.code,
            message: err.message,
            details: err.details,
          });
          setResponse(null);
          setIsLoading(false);
          return;
        }

        setResponse(data);
        setIsLoading(false);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't complete your search.";

        if (attempt < 2) {
          await delay(500 * attempt);
          return execute(attempt + 1);
        }

        setError({ code: "UNKNOWN_ERROR", message });
        setResponse(null);
        setIsLoading(false);
      }
    };

    await execute(1);
  }, []);

  useEffect(() => {
    if (hasSearched && !isLoading && (response || error)) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hasSearched, isLoading, response, error]);

  const resultCountText = useMemo(() => {
    if (!response || !lastRequest) return "";
    const q = lastRequest.query;
    const short = q.length > 60 ? `${q.slice(0, 60)}…` : q;
    return `${response.leads.length} result${response.leads.length === 1 ? "" : "s"} for "${short}"`;
  }, [response, lastRequest]);

  const handleSuggestion = useCallback((text: string) => {
    setPrefillQuery(text);
    setFormKey((k) => k + 1);
    document.getElementById("query")?.focus();
  }, []);

  return (
    <main className="flex flex-1 flex-col">
      <section
        className={cn(
          "mx-auto w-full px-4 transition-all duration-300 sm:px-6 lg:px-8",
          hasSearched
            ? "max-w-5xl py-6 lg:py-8"
            : "max-w-3xl py-10 lg:py-14"
        )}
      >
        <div className="flex flex-col gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Jobs & Leads Search
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">
            Type what you want.
            <br />
            Find your next move.
          </h1>
          <p
            className={cn(
              "mx-auto max-w-lg text-lg leading-relaxed text-slate-600 transition-opacity duration-300",
              hasSearched ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
            )}
          >
            One search for curated jobs, sales leads, and verified contacts.
          </p>
        </div>

        <div className="mt-8">
          <SearchForm
            key={formKey}
            onSubmit={handleSearch}
            isLoading={isLoading}
            initialMode={lastRequest?.mode ?? "jobs"}
            initialQuery={prefillQuery || lastRequest?.query || ""}
          />
        </div>
      </section>

      {hasSearched && (
        <section
          ref={resultsRef}
          className="mx-auto w-full max-w-4xl flex-1 px-4 pb-16 sm:px-6 lg:px-8"
          aria-label="Search results"
          aria-live="polite"
        >
          <div className="flex flex-col gap-8">
            {isLoading && <LoadingState />}

            {!isLoading && error && (
              <ErrorState
                code={error.code}
                message={error.message}
                details={error.details}
                onRetry={() => lastRequest && handleSearch(lastRequest)}
                onFocusInput={() => document.getElementById("query")?.focus()}
              />
            )}

            {!isLoading && response && (
              <>
                <ContextCard response={response} />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">{resultCountText}</p>
                  <div className="flex items-center gap-3">
                    {isMock && <MockBadge />}
                    <SortControls value={sort} onChange={setSort} />
                  </div>
                </div>

                {sortedLeads.length === 0 ? (
                  <EmptyState onSuggestion={handleSuggestion} />
                ) : (
                  <div className="flex flex-col">
                    {sortedLeads.map((lead, i) => (
                      <ResultCard
                        key={`${lead.type}-${lead.company}-${lead.opportunity}-${i}`}
                        lead={lead}
                        isLast={i === sortedLeads.length - 1}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
