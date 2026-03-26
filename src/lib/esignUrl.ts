/**
 * Returns the public e-sign base URL.
 * Uses the current origin in dev/preview, and the published domain in production.
 */
export function getEsignBaseUrl(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // Always use published URL for customer-facing links, never preview URLs
    if (origin.includes("id-preview--")) {
      return "https://trumoveinc.lovable.app";
    }
    return origin;
  }
  return "https://trumoveinc.lovable.app";
}
