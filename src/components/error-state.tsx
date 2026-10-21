"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
  onRetry?: () => void;
  onFocusInput?: () => void;
}

function getRetryAfter(details?: Record<string, unknown>): number {
  const raw = details?.retryAfter;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  return 60;
}

export function ErrorState({
  code = "UNKNOWN_ERROR",
  message,
  details,
  onRetry,
  onFocusInput,
}: ErrorStateProps) {
  const config =
    ERROR_COPY[code as keyof typeof ERROR_COPY] ?? ERROR_COPY.UNKNOWN_ERROR;
  const initialCountdown = code === "RATE_LIMITED" ? getRetryAfter(details) : 0;
  const [countdown, setCountdown] = useState(initialCountdown);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-2xl border border-red-200/70 bg-red-50/60 p-5 backdrop-blur-sm"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-slate-900">{config.title}</h3>
          <p className="text-sm leading-relaxed text-slate-700">
            {message || config.body}
          </p>
          <div className="mt-1">
            {code === "RATE_LIMITED" ? (
              <Button
                disabled={countdown > 0}
                onClick={onRetry}
                aria-disabled={countdown > 0}
              >
                {countdown > 0 ? `Retry in ${countdown}s` : "Try again"}
              </Button>
            ) : code === "VALIDATION_ERROR" ? (
              <Button onClick={onFocusInput}>Check your search</Button>
            ) : (
              <Button onClick={onRetry}>Try again</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ERROR_COPY = {
  VALIDATION_ERROR: {
    title: "Check your search",
    body: "Your request doesn't meet our requirements. Please update it and try again.",
  },
  RATE_LIMITED: {
    title: "Too many searches",
    body: "Please wait a minute before trying again.",
  },
  BACKEND_ERROR: {
    title: "Search didn't complete",
    body: "The backend returned an error. Please try again.",
  },
  TIMEOUT_ERROR: {
    title: "Search timed out",
    body: "This took too long. Try a shorter or more specific query.",
  },
  UNKNOWN_ERROR: {
    title: "Something went wrong",
    body: "We couldn't complete your search. Please check your connection and try again.",
  },
};
