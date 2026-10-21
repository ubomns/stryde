"use client";

import { useCallback, useState, FormEvent, KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "cn";
import { ModeSelector } from "@/components/mode-selector";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchMode, SearchRequest } from "@/lib/types";

const PLACEHOLDERS: Record<SearchMode, string> = {
  jobs: "Senior React engineer roles in Berlin, remote-first…",
  clients: "SaaS fintech startups in Europe hiring sales reps…",
  both: "n8n workflow automation opportunities in Berlin…",
};

interface SearchFormProps {
  onSubmit: (request: SearchRequest) => void;
  isLoading: boolean;
  initialQuery?: string;
  initialMode?: SearchMode;
}

export function SearchForm({
  onSubmit,
  isLoading,
  initialQuery = "",
  initialMode = "jobs",
}: SearchFormProps) {
  const [mode, setMode] = useState<SearchMode>(initialMode);
  const [query, setQuery] = useState(initialQuery);
  const [maxResults, setMaxResults] = useState<number>(15);
  const [touched, setTouched] = useState(false);

  const queryLength = query.length;
  const tooShort = queryLength < 10;
  const tooLong = queryLength > 1000;
  const isInvalid = tooShort || tooLong;
  const showError = touched && isInvalid;

  const handleModeChange = useCallback((nextMode: SearchMode) => {
    setMode(nextMode);
  }, []);

  const submit = useCallback(() => {
    setTouched(true);
    if (isInvalid) {
      document.getElementById("query")?.focus();
      return;
    }
    onSubmit({ mode, query: query.trim(), maxResults });
  }, [isInvalid, mode, query, maxResults, onSubmit]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      submit();
    },
    [submit]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    },
    [submit]
  );

  const errorId = "query-error";
  const counterId = "query-counter";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8 lg:p-10"
      noValidate
    >
      <div className="flex flex-col gap-5">
        <ModeSelector
          value={mode}
          onChange={handleModeChange}
          disabled={isLoading}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="query" className="text-slate-700">
            What are you looking for?
          </Label>
          <Textarea
            id="query"
            name="query"
            rows={4}
            placeholder={PLACEHOLDERS[mode]}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            aria-invalid={showError}
            aria-describedby={`${counterId} ${errorId}`}
            className={showError ? "aria-invalid" : ""}
          />
          <div className="flex items-start justify-between gap-4">
            <div id={errorId} aria-live="polite" className="min-h-[1.25rem]">
              {showError && tooShort && (
                <span className="text-sm text-red-600">
                  Please enter at least 10 characters.
                </span>
              )}
              {showError && tooLong && (
                <span className="text-sm text-red-600">
                  Please keep your request under 1000 characters.
                </span>
              )}
            </div>
            <span
              id={counterId}
              className={cn(
                "text-xs font-medium tabular-nums",
                tooLong ? "text-red-600" : "text-slate-500"
              )}
            >
              {queryLength} / 1000
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2 sm:w-44">
            <Label htmlFor="maxResults" className="text-slate-700">
              Max results
            </Label>
            <Select
              id="maxResults"
              value={String(maxResults)}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              disabled={isLoading}
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isInvalid}
            className="w-full sm:ml-auto sm:w-auto sm:min-w-[180px] lg:min-w-[200px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                Searching…
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
