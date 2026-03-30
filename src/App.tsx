import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import NotFound from "./pages/NotFound";
import PublicESign from "./pages/PublicESign";
import WorkspaceHub from "./pages/WorkspaceHub";
import RoleGuard from "./components/RoleGuard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDeveloper from "./pages/AdminDeveloper";
import ElevenLabsTrudyWidget from "./components/ElevenLabsTrudyWidget";
import ScrollToTop from "./components/ScrollToTop";
import { SeoOverrideProvider } from "./components/SeoOverrideProvider";
import { captureUtmParams } from "./lib/leadEnrichment";
import ProductionHomeRedirect from "./components/ProductionHomeRedirect";
import SiteRouteGuard from "./components/SiteRouteGuard";
import AdminSupportTickets from "./pages/AdminSupportTickets";
import ManagerEmployeeRequests from "./pages/ManagerEmployeeRequests";
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
import MarketingTemplates from "./pages/marketing/MarketingTemplates";
import MarketingSEO from "./pages/marketing/MarketingSEO";
import MarketingDashboard from "./pages/marketing/MarketingDashboard";
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
import DispatchFleet from "./pages/dispatch/DispatchFleet";
import DispatchDrivers from "./pages/dispatch/DispatchDrivers";
import DispatchRoutes from "./pages/dispatch/DispatchRoutes";
import DispatchJobs from "./pages/dispatch/DispatchJobs";
import Unsubscribe from "./pages/Unsubscribe";
import AgentIncomingLeads from "./pages/AgentIncomingLeads";

const queryClient = new QueryClient();

// Capture UTM params on initial load
captureUtmParams();

const App = () => (
  <HelmetProvider>
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <SeoOverrideProvider>
          <Routes>
            {/* ── Root: production domain → customer site; dev/preview → CRM login */}
            {/* Root: production domain → customer site; dev/preview → /dashboard */}
            <Route path="/" element={<ProductionHomeRedirect />} />
            <Route path="/dashboard" element={<WorkspaceHub />} />

            {/* Legacy redirects */}
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/agent-login" element={<Navigate to="/dashboard" replace />} />

            {/* ── Customer-facing website under /site ─────────────── */}
            {/* On CRM/dev, all /site/* redirects to workspace hub; on production they render normally */}
            <Route path="/site" element={<SiteRouteGuard />} />
            <Route path="/site/*" element={<SiteRouteGuard />} />

            {/* ── Public e-sign route (customer clicks from email) ── */}
            <Route path="/esign/:refNumber" element={<PublicESign />} />

            {/* ── CRM / Backend routes ─────────────────────────────── */}
            {/* Agent routes */}
            <Route path="/agent/dashboard" element={<RoleGuard allowedRoles={["agent"]}><AgentDashboard /></RoleGuard>} />
            <Route path="/agent/pipeline" element={<RoleGuard allowedRoles={["agent"]}><AgentPipeline /></RoleGuard>} />
            <Route path="/agent/profile" element={<ProfileSettings />} />
            <Route path="/agent/incoming" element={<RoleGuard allowedRoles={["agent"]}><AgentIncomingLeads /></RoleGuard>} />
            <Route path="/agent/operations" element={<RoleGuard allowedRoles={["agent"]}><AgentOperations /></RoleGuard>} />
            <Route path="/agent/new-customer" element={<RoleGuard allowedRoles={["agent"]}><AgentNewCustomer /></RoleGuard>} />
            <Route path="/agent/move-details/:leadId" element={<RoleGuard allowedRoles={["agent"]}><AgentMoveDetails /></RoleGuard>} />
            <Route path="/agent/inventory/:leadId" element={<RoleGuard allowedRoles={["agent"]}><AgentInventory /></RoleGuard>} />
            <Route path="/agent/dialer" element={<RoleGuard allowedRoles={["agent"]}><AgentDialerPage /></RoleGuard>} />
            <Route path="/agent/esign" element={<RoleGuard allowedRoles={["agent"]}><AgentESign /></RoleGuard>} />
            <Route path="/agent/esign/view" element={<RoleGuard allowedRoles={["agent"]}><ESignViewPage /></RoleGuard>} />
            <Route path="/agent/payment" element={<RoleGuard allowedRoles={["agent"]}><AgentPayment /></RoleGuard>} />
            <Route path="/agent/customers" element={<RoleGuard allowedRoles={["agent"]}><AgentCustomers /></RoleGuard>} />
            <Route path="/agent/customers/:id" element={<RoleGuard allowedRoles={["agent"]}><AgentCustomerDetail /></RoleGuard>} />
            <Route path="/agent/messages" element={<RoleGuard allowedRoles={["agent"]}><AgentMessaging /></RoleGuard>} />
            <Route path="/agent/team-chat" element={<RoleGuard allowedRoles={["agent"]}><AgentTeamChat /></RoleGuard>} />
            <Route path="/agent/pulse" element={<RoleGuard allowedRoles={["agent"]}><AgentPulse /></RoleGuard>} />
            <Route path="/agent/pulse/call/:callId" element={<RoleGuard allowedRoles={["agent"]}><AgentPulseCallReview /></RoleGuard>} />

            {/* Manager routes */}
            <Route path="/manager/dashboard" element={<RoleGuard allowedRoles={["manager"]}><ManagerDashboard /></RoleGuard>} />
            <Route path="/manager/pulse" element={<RoleGuard allowedRoles={["manager"]}><ManagerPulse /></RoleGuard>} />
            <Route path="/manager/pulse/call/:callId" element={<RoleGuard allowedRoles={["manager"]}><ManagerPulseCallReview /></RoleGuard>} />
            <Route path="/manager/team-chat" element={<RoleGuard allowedRoles={["manager"]}><ManagerTeamChat /></RoleGuard>} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<RoleGuard allowedRoles={["admin"]}><AdminDashboard /></RoleGuard>} />
            <Route path="/admin/developer" element={<RoleGuard allowedRoles={["admin"]}><AdminDeveloper /></RoleGuard>} />
            <Route path="/admin/employee-requests" element={<RoleGuard allowedRoles={["admin"]}><AdminSupportTickets /></RoleGuard>} />
            <Route path="/admin/users" element={<RoleGuard allowedRoles={["admin"]}><AdminUsersPage /></RoleGuard>} />
            <Route path="/admin/pricing" element={<RoleGuard allowedRoles={["admin"]}><AdminPricing /></RoleGuard>} />
            <Route path="/admin/lead-vendors" element={<RoleGuard allowedRoles={["admin"]}><AdminLeadVendors /></RoleGuard>} />
            <Route path="/admin/pulse" element={<RoleGuard allowedRoles={["admin"]}><AdminPulse /></RoleGuard>} />
            <Route path="/admin/pulse/call/:callId" element={<RoleGuard allowedRoles={["admin"]}><AdminPulseCallReview /></RoleGuard>} />
            <Route path="/admin/team-chat" element={<RoleGuard allowedRoles={["admin"]}><AdminTeamChat /></RoleGuard>} />

            {/* Leads & KPI (agent + manager access) */}
            <Route path="/leads/dashboard" element={<RoleGuard allowedRoles={["agent", "manager"]}><LeadsDashboard /></RoleGuard>} />
            <Route path="/leads/vendors" element={<RoleGuard allowedRoles={["admin"]}><AdminLeadVendors /></RoleGuard>} />
            <Route path="/leads/performance" element={<RoleGuard allowedRoles={["agent", "manager"]}><LeadsPerformance /></RoleGuard>} />
            <Route path="/kpi" element={<RoleGuard allowedRoles={["agent", "manager"]}><KpiDashboard /></RoleGuard>} />
            <Route path="/leaderboard" element={<RoleGuard allowedRoles={["agent", "manager"]}><Leaderboard /></RoleGuard>} />

            {/* Marketing routes */}
            <Route path="/marketing/dashboard" element={<RoleGuard allowedRoles={["marketing"]}><MarketingDashboard /></RoleGuard>} />
            <Route path="/marketing/templates" element={<RoleGuard allowedRoles={["marketing"]}><MarketingTemplates /></RoleGuard>} />
            <Route path="/marketing/seo" element={<RoleGuard allowedRoles={["marketing"]}><MarketingSEO /></RoleGuard>} />

            {/* Accounting */}
            <Route path="/accounting/dashboard" element={<RoleGuard allowedRoles={["admin", "accounting"]}><AccountingDashboard /></RoleGuard>} />

            {/* Dispatch routes */}
            <Route path="/dispatch/dashboard" element={<RoleGuard allowedRoles={["agent", "manager"]}><DispatchDashboard /></RoleGuard>} />
            <Route path="/dispatch/fleet" element={<RoleGuard allowedRoles={["agent", "manager"]}><DispatchFleet /></RoleGuard>} />
            <Route path="/dispatch/drivers" element={<RoleGuard allowedRoles={["agent", "manager"]}><DispatchDrivers /></RoleGuard>} />
            <Route path="/dispatch/routes" element={<RoleGuard allowedRoles={["agent", "manager"]}><DispatchRoutes /></RoleGuard>} />
            <Route path="/dispatch/jobs" element={<RoleGuard allowedRoles={["agent", "manager"]}><DispatchJobs /></RoleGuard>} />

            {/* Auth & misc (no role guard needed) */}
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/homepage-2" element={<HomepageV2 />} />
            <Route path="/customer-facing-sites" element={<CustomerFacingSites />} />
            <Route path="/tools/:tool" element={<IntegrationPlaceholder />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </SeoOverrideProvider>
          {/* <ElevenLabsTrudyWidget /> */}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </HelmetProvider>
);

export default App;
