import { Navigate, useLocation } from "react-router-dom";
import Index from "@/pages/Index";
import OnlineEstimate from "@/pages/OnlineEstimate";
import Book from "@/pages/Book";
import CarrierVetting from "@/pages/CarrierVetting";
import VettingDashboard from "@/pages/VettingDashboard";
import FAQ from "@/pages/FAQ";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import PropertyLookup from "@/pages/PropertyLookup";
import Auth from "@/pages/Auth";
import ScanRoom from "@/pages/ScanRoom";
import Classic from "@/pages/Classic";
import LiveTracking from "@/pages/LiveTracking";
import CustomerService from "@/pages/CustomerService";
import BlogListing from "@/pages/BlogListing";
import BlogPostPage from "@/pages/BlogPost";
import SiteCanonicalLayout from "./SiteCanonicalLayout";

const SITE_ROUTES: Record<string, React.ComponentType> = {
  "/site": Index,
  "/site/online-estimate": OnlineEstimate,
  "/site/book": Book,
  "/site/vetting": CarrierVetting,
  "/site/vetting-dashboard": VettingDashboard,
  "/site/carrier-vetting": CarrierVetting,
  "/site/faq": FAQ,
  "/site/about": About,
  "/site/privacy": Privacy,
  "/site/terms": Terms,
  "/site/property-lookup": PropertyLookup,
  "/site/auth": Auth,
  "/site/scan-room": ScanRoom,
  "/site/classic": Classic,
  "/site/track": LiveTracking,
  "/site/customer-service": CustomerService,
  "/site/blog": BlogListing,
};

/**
 * On CRM/dev environments, all /site/* routes redirect to the workspace hub.
 * On the production main domain, they render the customer-facing pages normally.
 */
export default function SiteRouteGuard() {
  const host = window.location.hostname;
  const location = useLocation();

  const isCrmOrDev =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    host.startsWith("crm.");

  if (isCrmOrDev) {
    return <Navigate to="/dashboard" replace />;
  }

  // Handle /site/blog/:slug dynamic route
  const blogPostMatch = location.pathname.match(/^\/site\/blog\/(.+)$/);
  if (blogPostMatch) {
    return (
      <SiteCanonicalLayout>
        <BlogPostPage />
      </SiteCanonicalLayout>
    );
  }

  const Page = SITE_ROUTES[location.pathname];
  if (!Page) {
    return <Navigate to="/" replace />;
  }

  return (
    <SiteCanonicalLayout>
      <Page />
    </SiteCanonicalLayout>
  );
}
