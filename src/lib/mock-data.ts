import { SearchResponse } from "@/lib/types";

export const mockJobResponse: SearchResponse = {
  mode: "jobs",
  intent_summary: "Remote AI automation roles at US companies",
  assumptions: ["No industry specified, searched broadly"],
  leads: [
    {
      type: "job",
      company: "Example Co",
      domain: "example.com",
      location: "United States",
      remote_status: "Remote",
      opportunity: "AI Automation Engineer",
      source_url: "https://example.com/jobs/123",
      why_it_fits: "Hiring for n8n and workflow automation skills.",
      priority: "High",
      posted_date: "2026-10-18",
      days_old: 2,
      contacts: [
        {
          name: "Jane Doe",
          title: "Head of Operations",
          email: "jane@example.com",
          email_status: "valid",
          linkedin_url: "",
        },
      ],
    },
    {
      type: "job",
      company: "Workflow Labs",
      domain: "workflowlabs.example",
      location: "San Francisco, CA",
      remote_status: "Hybrid",
      opportunity: "Senior Automation Consultant",
      source_url: "https://workflowlabs.example/careers/senior-automation",
      why_it_fits:
        "Looking for someone to design and maintain n8n workflows across the sales stack.",
      priority: "Medium",
      posted_date: "2026-10-15",
      days_old: 5,
      contacts: [
        {
          name: "Sam Rivera",
          title: "Talent Lead",
          email: "sam@workflowlabs.example",
          email_status: "unknown",
          linkedin_url: "https://linkedin.com/in/samrivera",
        },
      ],
    },
    {
      type: "job",
      company: "DataStream Inc",
      domain: "datastream.example",
      location: "Remote",
      remote_status: "Remote",
      opportunity: "Integration Engineer",
      source_url: "",
      why_it_fits: "API-first team building no-code/low-code integrations.",
      priority: "Low",
      posted_date: "2026-10-10",
      days_old: 10,
      contacts: [],
    },
  ],
  notes: "",
};

export const mockClientResponse: SearchResponse = {
  mode: "clients",
  intent_summary: "SaaS fintech startups in Europe with active sales hiring",
  assumptions: [
    "Focused on companies with public career pages",
    "European timezone preferred",
  ],
  leads: [
    {
      type: "client",
      company: "Finnovate Ltd",
      domain: "finnovate.example",
      location: "London, UK",
      remote_status: "Hybrid",
      opportunity: "Hiring Account Executives",
      source_url: "https://finnovate.example/careers",
      why_it_fits: "Early-stage fintech SaaS expanding sales team.",
      priority: "High",
      posted_date: "2026-10-15",
      days_old: 5,
      contacts: [
        {
          name: "John Smith",
          title: "VP of Sales",
          email: "john@finnovate.example",
          email_status: "valid",
          linkedin_url: "https://linkedin.com/in/johnsmith",
        },
      ],
    },
    {
      type: "client",
      company: "PayNext GmbH",
      domain: "paynext.example",
      location: "Berlin, Germany",
      remote_status: "On-site",
      opportunity: "Scaling customer success team",
      source_url: "https://paynext.example/jobs",
      why_it_fits: "Growing fast and likely needs workflow automation support.",
      priority: "Medium",
      posted_date: "2026-10-14",
      days_old: 6,
      contacts: [
        {
          name: "Lisa Müller",
          title: "Head of Customer Success",
          email: "lisa@paynext.example",
          email_status: "invalid",
          linkedin_url: "",
        },
      ],
    },
  ],
  notes: "",
};

export const mockBothResponse: SearchResponse = {
  mode: "both",
  intent_summary: "n8n workflow automation opportunities in Berlin",
  assumptions: ["Combined job listings and prospective client companies"],
  leads: [
    {
      type: "job",
      company: "Workflow GmbH",
      domain: "workflow.example",
      location: "Berlin, Germany",
      remote_status: "Hybrid",
      opportunity: "Automation Engineer",
      source_url: "https://workflow.example/jobs/42",
      why_it_fits: "Actively hiring for n8n automation expertise.",
      priority: "High",
      posted_date: "2026-10-18",
      days_old: 2,
      contacts: [],
    },
    {
      type: "client",
      company: "ProcessFirst UG",
      domain: "processfirst.example",
      location: "Berlin, Germany",
      remote_status: "On-site",
      opportunity: "Hiring operations talent — likely automation needs",
      source_url: "https://processfirst.example/careers",
      why_it_fits: "Growing ops team signals automation consulting opportunity.",
      priority: "Medium",
      posted_date: "2026-10-16",
      days_old: 4,
      contacts: [
        {
          name: "Anna Müller",
          title: "Head of Operations",
          email: "anna@processfirst.example",
          email_status: "valid",
          linkedin_url: "https://linkedin.com/in/annamueller",
        },
      ],
    },
  ],
  notes: "",
};

export const mockPartialFailureResponse: SearchResponse = {
  mode: "clients",
  intent_summary: "SaaS fintech startups in Europe",
  assumptions: ["Focused on companies with public websites"],
  leads: [
    {
      type: "client",
      company: "Finnovate Ltd",
      domain: "finnovate.example",
      location: "London, UK",
      remote_status: "Hybrid",
      opportunity: "Hiring Account Executives",
      source_url: "https://finnovate.example/careers",
      why_it_fits: "Early-stage fintech SaaS expanding sales team.",
      priority: "High",
      posted_date: "2026-10-15",
      days_old: 5,
      contacts: [
        {
          name: "John Smith",
          title: "VP of Sales",
          email: "john@finnovate.example",
          email_status: "valid",
          linkedin_url: "https://linkedin.com/in/johnsmith",
        },
      ],
    },
  ],
  notes: "Hunter contact verification was temporarily unavailable; results may lack verified emails.",
};

export function getMockResponse(mode: "jobs" | "clients" | "both"): SearchResponse {
  if (mode === "clients") return mockClientResponse;
  if (mode === "both") return mockBothResponse;
  return mockJobResponse;
}
