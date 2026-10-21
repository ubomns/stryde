export { cn } from "cn";

export function isSafeUrl(url: string, allowedSchemes: string[]): boolean {
  try {
    const parsed = new URL(url);
    return allowedSchemes.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function isSafeWebUrl(url: string): boolean {
  return isSafeUrl(url, ["http:", "https:"]);
}

export function isSafeMailto(email: string): boolean {
  // Stricter email format check before using mailto:.
  // Allows common local-part characters and a domain with a TLD.
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    email
  );
}
