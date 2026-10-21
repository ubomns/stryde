import { describe, it, expect } from "vitest";
import { searchSchema } from "@/lib/validation";

describe("searchSchema", () => {
  it("accepts a valid request", () => {
    const result = searchSchema.safeParse({
      mode: "jobs",
      query: "Remote React roles in Berlin",
      maxResults: 10,
    });
    expect(result.success).toBe(true);
  });

  it("defaults maxResults to 15", () => {
    const result = searchSchema.parse({
      mode: "clients",
      query: "SaaS fintech startups in Europe",
    });
    expect(result.maxResults).toBe(15);
  });

  it("rejects a query shorter than 10 characters", () => {
    const result = searchSchema.safeParse({
      mode: "jobs",
      query: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects maxResults greater than 15", () => {
    const result = searchSchema.safeParse({
      mode: "both",
      query: "n8n workflow automation opportunities",
      maxResults: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported mode", () => {
    const result = searchSchema.safeParse({
      mode: "unknown",
      query: "Remote React roles in Berlin",
    });
    expect(result.success).toBe(false);
  });
});
