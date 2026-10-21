import { SearchResponse } from "@/lib/types";

export type SortOption = "default" | "priority" | "recency";

export function sortLeads(
  leads: SearchResponse["leads"],
  sort: SortOption
): SearchResponse["leads"] {
  if (sort === "default") return leads;

  const priorityRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

  return [...leads].sort((a, b) => {
    if (sort === "priority") {
      const pa = priorityRank[a.priority] ?? 0;
      const pb = priorityRank[b.priority] ?? 0;
      return pb - pa;
    }
    if (sort === "recency") {
      const da = Number(new Date(a.posted_date));
      const db = Number(new Date(b.posted_date));
      if (Number.isNaN(da) && Number.isNaN(db)) return 0;
      if (Number.isNaN(da)) return 1;
      if (Number.isNaN(db)) return -1;
      return db - da;
    }
    return 0;
  });
}
