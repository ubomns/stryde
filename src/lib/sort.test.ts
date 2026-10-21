import { describe, it, expect } from "vitest";
import { sortLeads } from "@/lib/sort";
import { Lead } from "@/lib/types";

const leads: Lead[] = [
  {
    type: "job",
    company: "A",
    domain: "a.com",
    location: "Remote",
    remote_status: "Remote",
    opportunity: "Dev",
    source_url: "",
    why_it_fits: "",
    priority: "Low",
    posted_date: "2026-10-10",
    days_old: 10,
    contacts: [],
  },
  {
    type: "job",
    company: "B",
    domain: "b.com",
    location: "Remote",
    remote_status: "Remote",
    opportunity: "Lead",
    source_url: "",
    why_it_fits: "",
    priority: "High",
    posted_date: "2026-10-18",
    days_old: 2,
    contacts: [],
  },
  {
    type: "job",
    company: "C",
    domain: "c.com",
    location: "Remote",
    remote_status: "Remote",
    opportunity: "Mid",
    source_url: "",
    why_it_fits: "",
    priority: "Medium",
    posted_date: "2026-10-14",
    days_old: 6,
    contacts: [],
  },
];

describe("sortLeads", () => {
  it("returns original order for default", () => {
    expect(sortLeads(leads, "default")).toEqual(leads);
  });

  it("sorts by priority high to low", () => {
    const sorted = sortLeads(leads, "priority");
    expect(sorted.map((l) => l.priority)).toEqual(["High", "Medium", "Low"]);
  });

  it("sorts by recency newest first", () => {
    const sorted = sortLeads(leads, "recency");
    expect(sorted.map((l) => l.posted_date)).toEqual([
      "2026-10-18",
      "2026-10-14",
      "2026-10-10",
    ]);
  });
});
