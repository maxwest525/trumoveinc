/**
 * Hostname detection utilities.
 *
 * trumoveinc.com        → customer-facing site
 * crm.trumoveinc.com    → employee CRM (auth-gated)
 * localhost / lovable.app → CRM by default (dev/preview)
 *
 * Admin can override via /admin/domains settings (stored in localStorage).
 */

const CRM_SUBDOMAIN = "crm";

interface DomainConfig {
  customerDomain: string;
  crmDomain: string;
}

function getConfig(): DomainConfig | null {
  try {
    const raw = localStorage.getItem("trumove_domain_config");
    if (raw) {
      const cfg = JSON.parse(raw) as DomainConfig;
      if (cfg.customerDomain || cfg.crmDomain) return cfg;
    }
  } catch {}
  return null;
}

/** Returns true when the visitor is on the CRM domain (or dev/preview). */
export function isCrmDomain(): boolean {
  const host = window.location.hostname;

  // Check admin-configured domains first
  const cfg = getConfig();
  if (cfg) {
    if (cfg.crmDomain && host === cfg.crmDomain) return true;
    if (cfg.customerDomain && host === cfg.customerDomain) return false;
  }

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
