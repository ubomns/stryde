import { describe, it, expect } from "vitest";
import {
  getMockResponse,
  mockJobResponse,
  mockClientResponse,
  mockBothResponse,
  mockPartialFailureResponse,
} from "@/lib/mock-data";

describe("mock data", () => {
  it("returns job response for jobs mode", () => {
    expect(getMockResponse("jobs")).toBe(mockJobResponse);
  });

  it("returns client response for clients mode", () => {
    expect(getMockResponse("clients")).toBe(mockClientResponse);
  });

  it("returns both response for both mode", () => {
    expect(getMockResponse("both")).toBe(mockBothResponse);
  });

  it("includes contacts with email status", () => {
    const job = mockJobResponse;
    expect(job.leads[0].contacts?.[0].email_status).toBe("valid");
  });

  it("partial failure response has notes", () => {
    expect(mockPartialFailureResponse.notes).toContain("Hunter");
  });
});
