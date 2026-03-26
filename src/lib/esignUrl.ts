/**
 * Returns the public e-sign base URL.
 * Uses the current origin in dev/preview, and the published domain in production.
 */
export function getEsignBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://trumoveinc.lovable.app";
}
