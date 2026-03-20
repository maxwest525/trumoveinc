/**
 * Hostname detection utilities.
 *
 * trumoveinc.com        → customer-facing site
 * crm.trumoveinc.com    → employee CRM (auth-gated)
 * localhost / lovable.app → CRM by default (dev/preview)
 */

const CRM_SUBDOMAIN = "crm";

/** Returns true when the visitor is on the CRM domain (or dev/preview). */
export function isCrmDomain(): boolean {
  const host = window.location.hostname;

  // Dev & preview environments → CRM
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".lovable.app")) {
    return true;
  }

  // Explicit crm subdomain
  return host.startsWith(`${CRM_SUBDOMAIN}.`);
}

/** Returns true when the visitor is on the main customer-facing domain. */
export function isMainDomain(): boolean {
  return !isCrmDomain();
}

/**
 * Returns the correct path prefix for customer-facing links.
 * On main domain → "" (no prefix)
 * On CRM domain  → "/site"
 */
export function sitePrefix(): string {
  return isMainDomain() ? "" : "/site";
}
