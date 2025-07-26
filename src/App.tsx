import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MarketingPixels } from "@/components/MarketingPixels";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import Auth from "./pages/Auth";

import AdminProperties from "./pages/AdminProperties";
import AdminPropertyNew from "./pages/AdminPropertyNew";
import AdminPropertyEdit from "./pages/AdminPropertyEdit";
import AdminCRM from "./pages/AdminCRM";
import AdminContacts from "./pages/AdminContacts";
import AdminContactDetail from "./pages/AdminContactDetail";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminSettings } from "./pages/AdminSettings";

import AdminLayout from "./components/admin/AdminLayout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MarketingPixels />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes with Layout - All protected */}
            <Route element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/properties" element={<AdminProperties />} />
              <Route path="/admin/properties/new" element={<AdminPropertyNew />} />
              <Route path="/admin/properties/edit/:id" element={<AdminPropertyEdit />} />
              <Route path="/admin/crm" element={<AdminCRM />} />
              <Route path="/admin/contacts" element={<AdminContacts />} />
              <Route path="/admin/contacts/:id" element={<AdminContactDetail />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
            
            {/* Redirect /admin to /auth */}
            <Route path="/admin" element={<Navigate to="/auth" replace />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
