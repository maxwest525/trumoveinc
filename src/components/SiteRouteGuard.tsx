import { Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import SiteCanonicalLayout from "./SiteCanonicalLayout";

/**
 * On CRM/dev environments, /site redirects to the workspace hub.
 * On the production main domain, it renders the customer homepage.
 */
export default function SiteRouteGuard() {
  const host = window.location.hostname;

  const isCrmOrDev =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app") ||
    host.startsWith("crm.");

  if (isCrmOrDev) {
    return <Navigate to="/" replace />;
  }

  return (
    <SiteCanonicalLayout>
      <Index />
    </SiteCanonicalLayout>
  );
}
