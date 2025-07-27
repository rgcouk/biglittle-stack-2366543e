import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound";
import ProviderDashboard from "./pages/provider/Dashboard";
import UnitsManagement from "./pages/provider/UnitsManagement";
import CustomersManagement from "./pages/provider/CustomersManagement";
import BillingManagement from "./pages/provider/BillingManagement";
import ProviderAnalytics from "./pages/provider/Analytics";
import SiteCustomization from "./pages/provider/SiteCustomization";
import CustomerStorefront from "./pages/customer/Storefront";
import UnitBrowser from "./pages/customer/UnitBrowser";
import UnitDetails from "./pages/customer/UnitDetails";
import BookingFlow from "./pages/customer/BookingFlow";
import CustomerAccount from "./pages/customer/Account";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<Demo />} />
          
          {/* Storage Provider Dashboard Routes */}
          <Route path="/provider" element={<ProviderDashboard />} />
          <Route path="/provider/units" element={<UnitsManagement />} />
          <Route path="/provider/customers" element={<CustomersManagement />} />
          <Route path="/provider/billing" element={<BillingManagement />} />
          <Route path="/provider/analytics" element={<ProviderAnalytics />} />
          <Route path="/provider/customize" element={<SiteCustomization />} />
          
          {/* Customer-Facing Storefront Routes */}
          <Route path="/storefront/:providerId?" element={<CustomerStorefront />} />
          <Route path="/storefront/:providerId/units" element={<UnitBrowser />} />
          <Route path="/storefront/:providerId/unit/:unitId" element={<UnitDetails />} />
          <Route path="/storefront/:providerId/book/:unitId" element={<BookingFlow />} />
          <Route path="/account" element={<CustomerAccount />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
