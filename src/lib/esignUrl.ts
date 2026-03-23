/**
 * Returns the base URL for public e-sign links.
 * Uses the published domain so customers don't hit Lovable preview auth gates.
 */
export function getEsignBaseUrl(): string {
  const host = window.location.hostname;
  // In production (custom domain or published .lovable.app), use current origin
  if (host === "trumoveinc.lovable.app" || host === "trumoveinc.com" || host === "www.trumoveinc.com") {
    return window.location.origin;
  }
  // In dev/preview, hardcode to published URL so customer links work
  return "https://trumoveinc.lovable.app";
}
