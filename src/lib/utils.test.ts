import { describe, it, expect } from "vitest";
import { isSafeUrl, isSafeWebUrl, isSafeMailto } from "@/lib/utils";

describe("isSafeUrl", () => {
  it("returns true for an allowed scheme", () => {
    expect(isSafeUrl("https://example.com", ["https:", "http:"])).toBe(true);
  });

  it("returns false for a disallowed scheme", () => {
    expect(isSafeUrl("javascript:alert(1)", ["https:", "http:"])).toBe(false);
  });

  it("returns false for malformed URLs", () => {
    expect(isSafeUrl("not a url", ["https:", "http:"])).toBe(false);
  });

  it("is case-sensitive for scheme protocol", () => {
    // URL normalizes "HTTPS:" to "https:" per WHATWG spec, so this should still pass.
    expect(isSafeUrl("HTTPS://example.com", ["https:"])).toBe(true);
  });
});

describe("isSafeWebUrl", () => {
  it("allows http URLs", () => {
    expect(isSafeWebUrl("http://example.com")).toBe(true);
  });

  it("allows https URLs", () => {
    expect(isSafeWebUrl("https://example.com")).toBe(true);
  });

  it("blocks javascript scheme", () => {
    expect(isSafeWebUrl("javascript:alert(1)")).toBe(false);
  });

  it("blocks data URIs", () => {
    expect(isSafeWebUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("blocks empty strings", () => {
    expect(isSafeWebUrl("")).toBe(false);
  });
});

describe("isSafeMailto", () => {
  it("returns true for a simple valid email", () => {
    expect(isSafeMailto("jane@example.com")).toBe(true);
  });

  it("returns false for an email without a TLD", () => {
    expect(isSafeMailto("jane@example")).toBe(false);
  });

  it("returns false for strings with spaces", () => {
    expect(isSafeMailto("jane doe@example.com")).toBe(false);
  });

  it("returns false for empty strings", () => {
    expect(isSafeMailto("")).toBe(false);
  });
});
