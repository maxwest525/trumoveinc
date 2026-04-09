import { Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import SiteCanonicalLayout from "./SiteCanonicalLayout";

/**
 * Hostname-based routing for the root path "/":
 *   crm.trumoveinc.com  → /dashboard (CRM workspace hub)
 *   trumoveinc.com       → Customer homepage rendered directly at "/"
 *   localhost / preview   → /dashboard (dev default)
 */
export default function ProductionHomeRedirect() {
  const host = window.location.hostname;
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const isRecoveryLink = hashParams.get("type") === "recovery" && Boolean(hashParams.get("access_token"));

  if (isRecoveryLink) {
    return <Navigate to={{ pathname: "/reset-password", hash: window.location.hash }} replace />;
  }

  const isDev =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com");

  // Dev/preview and CRM subdomain → workspace hub
  if (isDev || host.startsWith("crm.")) {
    return <Navigate to="/dashboard" replace />;
  }

  // Main production domain → customer homepage at "/"
  return (
    <SiteCanonicalLayout>
      <Index />
    </SiteCanonicalLayout>
  );
}
