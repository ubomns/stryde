import { z } from "zod";

export const searchSchema = z.object({
  mode: z.enum(["jobs", "clients", "both"]),
  query: z.string().min(10).max(1000),
  maxResults: z.coerce.number().int().min(1).max(15).default(15),
});

const contactSchema = z.object({
  name: z.string().default(""),
  title: z.string().default(""),
  email: z.string().default(""),
  email_status: z.string().default("unknown"),
  linkedin_url: z.string().default(""),
});

const leadSchema = z.object({
  type: z.string().default(""),
  company: z.string().default(""),
  domain: z.string().default(""),
  location: z.string().default(""),
  remote_status: z.string().optional(),
  remote: z.string().optional(),
  remote_preference: z.string().optional(),
  opportunity: z.string().default(""),
  source_url: z.string().default(""),
  why_it_fits: z.string().default(""),
  priority: z.string().default(""),
  posted_date: z.string().default(""),
  days_old: z.number().default(0),
  contacts: z.array(contactSchema).optional().default([]),
  notes: z.string().optional(),
});

export const searchResponseSchema = z.object({
  mode: z.enum(["jobs", "clients", "both"]),
  intent_summary: z.string().optional(),
  assumptions: z.array(z.string()).default([]),
  leads: z.array(leadSchema).default([]),
  notes: z.string().optional(),
});

export type ValidatedSearchRequest = z.infer<typeof searchSchema>;
export type ValidatedSearchResponse = z.infer<typeof searchResponseSchema>;

