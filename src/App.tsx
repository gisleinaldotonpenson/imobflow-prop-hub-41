import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import AdminLogin from "./pages/AdminLogin";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin Routes with Layout */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/properties/new" element={<AdminPropertyNew />} />
            <Route path="/admin/properties/edit/:id" element={<AdminPropertyEdit />} />
            <Route path="/admin/crm" element={<AdminCRM />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
            <Route path="/admin/contacts/:id" element={<AdminContactDetail />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
