import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
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
import PublicESign from "./pages/PublicESign";
import WorkspaceHub from "./pages/WorkspaceHub";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDeveloper from "./pages/AdminDeveloper";
import ScanRoom from "./pages/ScanRoom";
import Classic from "./pages/Classic";
import LiveTracking from "./pages/LiveTracking";
import ElevenLabsTrudyWidget from "./components/ElevenLabsTrudyWidget";
import ScrollToTop from "./components/ScrollToTop";
import { SeoOverrideProvider } from "./components/SeoOverrideProvider";
import SiteCanonicalLayout from "./components/SiteCanonicalLayout";
import { captureUtmParams } from "./lib/leadEnrichment";
import CustomerService from "./pages/CustomerService";
import ProductionHomeRedirect from "./components/ProductionHomeRedirect";
import SiteRouteGuard from "./components/SiteRouteGuard";
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
            {/* On CRM/dev, /site redirects to workspace hub; on production main domain it renders normally */}
            <Route path="/site" element={<SiteRouteGuard />} />
            <Route path="/site/online-estimate" element={<SiteCanonicalLayout><OnlineEstimate /></SiteCanonicalLayout>} />
            <Route path="/site/book" element={<SiteCanonicalLayout><Book /></SiteCanonicalLayout>} />
            <Route path="/site/vetting" element={<SiteCanonicalLayout><CarrierVetting /></SiteCanonicalLayout>} />
            <Route path="/site/vetting-dashboard" element={<SiteCanonicalLayout><VettingDashboard /></SiteCanonicalLayout>} />
            <Route path="/site/carrier-vetting" element={<SiteCanonicalLayout><CarrierVetting /></SiteCanonicalLayout>} />
            <Route path="/site/faq" element={<SiteCanonicalLayout><FAQ /></SiteCanonicalLayout>} />
            <Route path="/site/about" element={<SiteCanonicalLayout><About /></SiteCanonicalLayout>} />
            <Route path="/site/privacy" element={<SiteCanonicalLayout><Privacy /></SiteCanonicalLayout>} />
            <Route path="/site/terms" element={<SiteCanonicalLayout><Terms /></SiteCanonicalLayout>} />
            <Route path="/site/property-lookup" element={<SiteCanonicalLayout><PropertyLookup /></SiteCanonicalLayout>} />
            <Route path="/site/auth" element={<SiteCanonicalLayout><Auth /></SiteCanonicalLayout>} />
            <Route path="/site/scan-room" element={<SiteCanonicalLayout><ScanRoom /></SiteCanonicalLayout>} />
            <Route path="/site/classic" element={<SiteCanonicalLayout><Classic /></SiteCanonicalLayout>} />
            <Route path="/site/track" element={<SiteCanonicalLayout><LiveTracking /></SiteCanonicalLayout>} />
            <Route path="/site/customer-service" element={<SiteCanonicalLayout><CustomerService /></SiteCanonicalLayout>} />

            {/* ── Public e-sign route (customer clicks from email) ── */}
            <Route path="/esign/:refNumber" element={<PublicESign />} />

            {/* ── CRM / Backend routes ─────────────────────────────── */}
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/admin/developer" element={<AdminDeveloper />} />
            <Route path="/admin/employee-requests" element={<AdminSupportTickets />} />
            <Route path="/agent/pipeline" element={<AgentPipeline />} />
            <Route path="/agent/profile" element={<ProfileSettings />} />
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/lead-vendors" element={<AdminLeadVendors />} />
            <Route path="/leads/dashboard" element={<LeadsDashboard />} />
            <Route path="/leads/vendors" element={<AdminLeadVendors />} />
            <Route path="/leads/performance" element={<LeadsPerformance />} />
            <Route path="/kpi" element={<KpiDashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/marketing/dashboard" element={<MarketingDashboard />} />
            <Route path="/marketing/templates" element={<MarketingTemplates />} />
            <Route path="/marketing/seo" element={<MarketingSEO />} />
            <Route path="/accounting/dashboard" element={<AccountingDashboard />} />
            
            <Route path="/agent/incoming" element={<AgentIncomingLeads />} />
            <Route path="/agent/operations" element={<AgentOperations />} />
            <Route path="/agent/new-customer" element={<AgentNewCustomer />} />
            <Route path="/agent/move-details/:leadId" element={<AgentMoveDetails />} />
            <Route path="/agent/inventory/:leadId" element={<AgentInventory />} />
            <Route path="/agent/dialer" element={<AgentDialerPage />} />
            <Route path="/agent/esign" element={<AgentESign />} />
            <Route path="/agent/esign/view" element={<ESignViewPage />} />
            <Route path="/agent/payment" element={<AgentPayment />} />
            <Route path="/agent/customers" element={<AgentCustomers />} />
            <Route path="/agent/customers/:id" element={<AgentCustomerDetail />} />
            <Route path="/agent/messages" element={<AgentMessaging />} />
            <Route path="/agent/team-chat" element={<AgentTeamChat />} />
            
            <Route path="/portal" element={<CustomerPortal />} />
            <Route path="/portal/dashboard" element={<CustomerPortalDashboard />} />
            <Route path="/homepage-2" element={<HomepageV2 />} />
            <Route path="/customer-facing-sites" element={<CustomerFacingSites />} />
            <Route path="/tools/:tool" element={<IntegrationPlaceholder />} />
            <Route path="/agent/pulse" element={<AgentPulse />} />
            <Route path="/agent/pulse/call/:callId" element={<AgentPulseCallReview />} />
            <Route path="/manager/pulse" element={<ManagerPulse />} />
            <Route path="/manager/pulse/call/:callId" element={<ManagerPulseCallReview />} />
            <Route path="/admin/pulse" element={<AdminPulse />} />
            <Route path="/admin/pulse/call/:callId" element={<AdminPulseCallReview />} />
            <Route path="/manager/team-chat" element={<ManagerTeamChat />} />
            <Route path="/admin/team-chat" element={<AdminTeamChat />} />
            <Route path="/dispatch/dashboard" element={<DispatchDashboard />} />
            <Route path="/dispatch/fleet" element={<DispatchFleet />} />
            <Route path="/dispatch/drivers" element={<DispatchDrivers />} />
            <Route path="/dispatch/routes" element={<DispatchRoutes />} />
            <Route path="/dispatch/jobs" element={<DispatchJobs />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            
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
