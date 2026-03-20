import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { isCrmDomain, isMainDomain } from "@/lib/hostDetection";
import RequireAuth from "@/components/auth/RequireAuth";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OnlineEstimate from "./pages/OnlineEstimate";
import Book from "./pages/Book";
import Vetting from "./pages/Vetting";
import VettingDashboard from "./pages/VettingDashboard";
import CarrierVetting from "./pages/CarrierVetting";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PropertyLookup from "./pages/PropertyLookup";
import Auth from "./pages/Auth";
import AgentLogin from "./pages/AgentLogin";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDeveloper from "./pages/AdminDeveloper";
import ScanRoom from "./pages/ScanRoom";
import Classic from "./pages/Classic";
import LiveTracking from "./pages/LiveTracking";
import CustomerService from "./pages/CustomerService";
import AdminSupportTickets from "./pages/AdminSupportTickets";
import AgentPipeline from "./pages/AgentPipeline";
import ProfileSettings from "./pages/ProfileSettings";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminLeadVendors from "./pages/AdminLeadVendors";
import LeadsDashboard from "./pages/LeadsDashboard";
import LeadsPerformance from "./pages/LeadsPerformance";
import KpiDashboard from "./pages/KpiDashboard";
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import GrowthDashboard from "./pages/growth-engine/GrowthDashboard";
import GrowthCampaigns from "./pages/growth-engine/GrowthCampaigns";
import GrowthIntegrations from "./pages/growth-engine/GrowthIntegrations";
import GrowthLandingPages from "./pages/growth-engine/GrowthLandingPages";
import GrowthRouting from "./pages/growth-engine/GrowthRouting";
import AccountingDashboard from "./pages/AccountingDashboard";
import AgentOperations from "./pages/AgentOperations";
import AgentNewCustomer from "./pages/AgentNewCustomer";
import AgentDialerPage from "./pages/AgentDialerPage";
import AgentESign from "./pages/AgentESign";
import ESignViewPage from "./pages/ESignViewPage";
import AgentPayment from "./pages/AgentPayment";
import AgentCustomers from "./pages/AgentCustomers";
import AgentCustomerDetail from "./pages/AgentCustomerDetail";
import AgentMessaging from "./pages/AgentMessaging";
import AgentTeamChat from "./pages/AgentTeamChat";
import CustomerPortal from "./pages/CustomerPortal";
import CustomerPortalDashboard from "./pages/CustomerPortalDashboard";
import HomepageV2 from "./pages/HomepageV2";
import AgentInventory from "./pages/AgentInventory";
import AgentMoveDetails from "./pages/AgentMoveDetails";
import CustomerFacingSites from "./pages/CustomerFacingSites";
import IntegrationPlaceholder from "./pages/IntegrationPlaceholder";
import AdminPricing from "./pages/AdminPricing";
import AdminDomains from "./pages/AdminDomains";
import PulseCallReview from "./pages/pulse/PulseCallReview";
import AgentPulse from "./pages/AgentPulse";
import ManagerPulse from "./pages/ManagerPulse";
import AdminPulse from "./pages/AdminPulse";
import AgentPulseCallReview from "./pages/AgentPulseCallReview";
import ManagerPulseCallReview from "./pages/ManagerPulseCallReview";
import AdminPulseCallReview from "./pages/AdminPulseCallReview";
import ManagerTeamChat from "./pages/ManagerTeamChat";
import AdminTeamChat from "./pages/AdminTeamChat";
import Leaderboard from "./pages/Leaderboard";
import DispatchDashboard from "./pages/DispatchDashboard";

import ElevenLabsTrudyWidget from "./components/ElevenLabsTrudyWidget";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

/* ── Shared customer-facing routes (used at / on main domain, /site/* on CRM domain) ── */
const customerRoutes = (prefix: string) => (
  <>
    <Route path={`${prefix}`} element={<Index />} />
    <Route path={`${prefix}/online-estimate`} element={<OnlineEstimate />} />
    <Route path={`${prefix}/book`} element={<Book />} />
    <Route path={`${prefix}/vetting`} element={<CarrierVetting />} />
    <Route path={`${prefix}/vetting-dashboard`} element={<VettingDashboard />} />
    <Route path={`${prefix}/carrier-vetting`} element={<CarrierVetting />} />
    <Route path={`${prefix}/faq`} element={<FAQ />} />
    <Route path={`${prefix}/about`} element={<About />} />
    <Route path={`${prefix}/privacy`} element={<Privacy />} />
    <Route path={`${prefix}/terms`} element={<Terms />} />
    <Route path={`${prefix}/property-lookup`} element={<PropertyLookup />} />
    <Route path={`${prefix}/auth`} element={<Auth />} />
    <Route path={`${prefix}/scan-room`} element={<ScanRoom />} />
    <Route path={`${prefix}/classic`} element={<Classic />} />
    <Route path={`${prefix}/track`} element={<LiveTracking />} />
    <Route path={`${prefix}/customer-service`} element={<CustomerService />} />
  </>
);

/* ── Auth-gated CRM routes ── */
const crmRoutes = (
  <>
    <Route path="/agent/dashboard" element={<RequireAuth><AgentDashboard /></RequireAuth>} />
    <Route path="/admin/developer" element={<RequireAuth><AdminDeveloper /></RequireAuth>} />
    <Route path="/admin/employee-requests" element={<RequireAuth><AdminSupportTickets /></RequireAuth>} />
    <Route path="/agent/pipeline" element={<RequireAuth><AgentPipeline /></RequireAuth>} />
    <Route path="/agent/profile" element={<RequireAuth><ProfileSettings /></RequireAuth>} />
    <Route path="/manager/dashboard" element={<RequireAuth><ManagerDashboard /></RequireAuth>} />
    <Route path="/admin/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
    <Route path="/admin/users" element={<RequireAuth><AdminUsersPage /></RequireAuth>} />
    <Route path="/admin/pricing" element={<RequireAuth><AdminPricing /></RequireAuth>} />
    <Route path="/admin/domains" element={<RequireAuth><AdminDomains /></RequireAuth>} />
    <Route path="/admin/lead-vendors" element={<RequireAuth><AdminLeadVendors /></RequireAuth>} />
    <Route path="/leads/dashboard" element={<RequireAuth><LeadsDashboard /></RequireAuth>} />
    <Route path="/leads/vendors" element={<RequireAuth><AdminLeadVendors /></RequireAuth>} />
    <Route path="/leads/performance" element={<RequireAuth><LeadsPerformance /></RequireAuth>} />
    <Route path="/kpi" element={<RequireAuth><KpiDashboard /></RequireAuth>} />
    <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
    <Route path="/marketing/dashboard" element={<RequireAuth><GrowthDashboard /></RequireAuth>} />
    <Route path="/marketing/campaigns" element={<RequireAuth><GrowthCampaigns /></RequireAuth>} />
    <Route path="/marketing/integrations" element={<RequireAuth><GrowthIntegrations /></RequireAuth>} />
    <Route path="/marketing/landing-pages" element={<RequireAuth><GrowthLandingPages /></RequireAuth>} />
    <Route path="/marketing/routing" element={<RequireAuth><GrowthRouting /></RequireAuth>} />
    <Route path="/accounting/dashboard" element={<RequireAuth><AccountingDashboard /></RequireAuth>} />
    <Route path="/agent/operations" element={<RequireAuth><AgentOperations /></RequireAuth>} />
    <Route path="/agent/new-customer" element={<RequireAuth><AgentNewCustomer /></RequireAuth>} />
    <Route path="/agent/move-details/:leadId" element={<RequireAuth><AgentMoveDetails /></RequireAuth>} />
    <Route path="/agent/inventory/:leadId" element={<RequireAuth><AgentInventory /></RequireAuth>} />
    <Route path="/agent/dialer" element={<RequireAuth><AgentDialerPage /></RequireAuth>} />
    <Route path="/agent/esign" element={<RequireAuth><AgentESign /></RequireAuth>} />
    <Route path="/agent/esign/view" element={<RequireAuth><ESignViewPage /></RequireAuth>} />
    <Route path="/agent/payment" element={<RequireAuth><AgentPayment /></RequireAuth>} />
    <Route path="/agent/customers" element={<RequireAuth><AgentCustomers /></RequireAuth>} />
    <Route path="/agent/customers/:id" element={<RequireAuth><AgentCustomerDetail /></RequireAuth>} />
    <Route path="/agent/messages" element={<RequireAuth><AgentMessaging /></RequireAuth>} />
    <Route path="/agent/team-chat" element={<RequireAuth><AgentTeamChat /></RequireAuth>} />
    <Route path="/agent/pulse" element={<RequireAuth><AgentPulse /></RequireAuth>} />
    <Route path="/agent/pulse/call/:callId" element={<RequireAuth><AgentPulseCallReview /></RequireAuth>} />
    <Route path="/manager/pulse" element={<RequireAuth><ManagerPulse /></RequireAuth>} />
    <Route path="/manager/pulse/call/:callId" element={<RequireAuth><ManagerPulseCallReview /></RequireAuth>} />
    <Route path="/admin/pulse" element={<RequireAuth><AdminPulse /></RequireAuth>} />
    <Route path="/admin/pulse/call/:callId" element={<RequireAuth><AdminPulseCallReview /></RequireAuth>} />
    <Route path="/manager/team-chat" element={<RequireAuth><ManagerTeamChat /></RequireAuth>} />
    <Route path="/admin/team-chat" element={<RequireAuth><AdminTeamChat /></RequireAuth>} />
    <Route path="/dispatch/dashboard" element={<RequireAuth><DispatchDashboard /></RequireAuth>} />
    <Route path="/customer-facing-sites" element={<RequireAuth><CustomerFacingSites /></RequireAuth>} />
    <Route path="/tools/:tool" element={<RequireAuth><IntegrationPlaceholder /></RequireAuth>} />
    <Route path="/homepage-2" element={<RequireAuth><HomepageV2 /></RequireAuth>} />
  </>
);

const App = () => {
  const mainDomain = isMainDomain();
  const crmDomain = isCrmDomain();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* ── Root path depends on domain ── */}
              {mainDomain && (
                <>
                  {/* Main domain: customer site at root */}
                  {customerRoutes("")}
                  <Route path="/portal" element={<CustomerPortal />} />
                  <Route path="/portal/dashboard" element={<CustomerPortalDashboard />} />
                </>
              )}

              {crmDomain && (
                <>
                  {/* CRM domain: auth-gated portal at root */}
                  <Route path="/" element={<AgentLogin />} />
                  <Route path="/login" element={<AgentLogin />} />
                  <Route path="/agent-login" element={<Navigate to="/" replace />} />

                  {/* Customer site available under /site/* on CRM domain */}
                  {customerRoutes("/site")}

                  {/* Customer portal */}
                  <Route path="/portal" element={<CustomerPortal />} />
                  <Route path="/portal/dashboard" element={<CustomerPortalDashboard />} />
                </>
              )}

              {/* ── CRM routes (always available, auth-gated) ── */}
              {crmRoutes}

              {/* ── Shared unprotected routes ── */}
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/set-password" element={<SetPassword />} />

              {/* ── Catch-all ── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ElevenLabsTrudyWidget />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
