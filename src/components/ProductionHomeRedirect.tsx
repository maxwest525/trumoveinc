import AgentLogin from "@/pages/AgentLogin";
import Index from "@/pages/Index";
import SiteCanonicalLayout from "./SiteCanonicalLayout";

/**
 * Hostname-based routing for the root path "/":
 *   crm.trumoveinc.com  → Agent login (CRM)
 *   trumoveinc.com       → Customer homepage rendered directly at "/"
 *   localhost / preview   → Agent login (dev default)
 */
export default function ProductionHomeRedirect() {
  const host = window.location.hostname;

  const isDev =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app");

  // Dev/preview and CRM subdomain → agent login
  if (isDev || host.startsWith("crm.")) {
    return <AgentLogin />;
  }

  // Main production domain → customer homepage at "/"
  return (
    <SiteCanonicalLayout>
      <Index />
    </SiteCanonicalLayout>
  );
}
