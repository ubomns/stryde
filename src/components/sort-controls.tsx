"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SortOption } from "@/lib/sort";

interface SortControlsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Relevance" },
  { value: "priority", label: "Priority (High → Low)" },
  { value: "recency", label: "Newest first" },
];

export function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="sort" className="sr-only sm:not-sr-only text-slate-600">
        Sort by
      </Label>
      <Select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        aria-label="Sort results"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
