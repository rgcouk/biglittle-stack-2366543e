import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FacilityProvider } from "@/components/providers/FacilityProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthPage from "@/components/auth/AuthPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProviderRouter from "@/components/provider/ProviderRouter";
import { ProviderLayout } from "@/components/layout/ProviderLayout";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import UnitsManagement from "./pages/provider/UnitsManagement";
import ProviderSettings from "./pages/provider/Settings";
import FacilityOnboarding from "@/components/onboarding/FacilityOnboarding";
import FacilityStorefront from "./pages/facility/FacilityStorefront";
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerBookings from "./pages/customer/Bookings";
import ProviderAnalytics from "./pages/provider/Analytics";
import BillingManagement from "./pages/provider/BillingManagement";
import CustomersManagement from "./pages/provider/CustomersManagement";
import SiteCustomization from "./pages/provider/SiteCustomization";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FacilityProvider>
          <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Storage Provider Dashboard Routes */}
            <Route path="/provider" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ProviderRouter />} />
              <Route path="units" element={<UnitsManagement />} />
              <Route path="settings" element={<ProviderSettings />} />
              <Route path="analytics" element={<ProviderAnalytics />} />
              <Route path="billing" element={<BillingManagement />} />
              <Route path="customers" element={<CustomersManagement />} />
              <Route path="customization" element={<SiteCustomization />} />
              <Route path="onboarding" element={<FacilityOnboarding />} />
            </Route>
            
            {/* Public Facility Storefronts */}
            <Route path="/facility/:facilityId" element={<FacilityStorefront />} />
            
            {/* Customer Portal Routes */}
            <Route path="/customer" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<CustomerDashboard />} />
              <Route path="bookings" element={<CustomerBookings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
        </FacilityProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;