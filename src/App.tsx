import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthPage from "@/components/auth/AuthPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProviderRouter from "@/components/provider/ProviderRouter";
import UnitsManagement from "./pages/provider/UnitsManagement";
import ProviderSettings from "./pages/provider/Settings";
import FacilityOnboarding from "@/components/onboarding/FacilityOnboarding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Storage Provider Dashboard Routes */}
            <Route path="/provider" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderRouter />
              </ProtectedRoute>
            } />
            <Route path="/provider/units" element={
              <ProtectedRoute requiredRole="provider">
                <UnitsManagement />
              </ProtectedRoute>
            } />
            <Route path="/provider/settings" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderSettings />
              </ProtectedRoute>
            } />
            <Route path="/provider/onboarding" element={
              <ProtectedRoute requiredRole="provider">
                <FacilityOnboarding />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
