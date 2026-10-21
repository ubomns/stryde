"use client";

import { Briefcase, Target, Layers } from "lucide-react";
import { cn } from "cn";
import { SearchMode } from "@/lib/types";

interface ModeSelectorProps {
  value: SearchMode;
  onChange: (mode: SearchMode) => void;
  disabled?: boolean;
}

const MODES: {
  value: SearchMode;
  label: string;
  icon: React.ElementType;
  colorClass: string;
}[] = [
  { value: "jobs", label: "Jobs", icon: Briefcase, colorClass: "text-blue-600" },
  { value: "clients", label: "Leads", icon: Target, colorClass: "text-violet-600" },
  { value: "both", label: "Both", icon: Layers, colorClass: "text-emerald-600" },
];

export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  return (
    <fieldset className="w-full" disabled={disabled}>
      <legend className="sr-only">Search mode</legend>
      <div className="mx-auto flex w-fit rounded-full bg-slate-100/90 p-1 backdrop-blur-sm">
        {MODES.map((mode) => {
          const selected = value === mode.value;
          const Icon = mode.icon;
          return (
            <button
              key={mode.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(mode.value)}
              className={cn(
                "relative flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:px-6",
                selected
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <Icon
                className={cn(
                  "size-4 transition-colors duration-200",
                  selected ? mode.colorClass : "text-slate-500"
                )}
                aria-hidden="true"
              />
              <span className={selected ? "font-semibold" : ""}>
                {mode.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
