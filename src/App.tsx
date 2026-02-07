import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardRedirect } from "@/components/DashboardRedirect";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompanyDashboard from "./pages/dashboard/CompanyDashboard";
import EmissionReports from "./pages/dashboard/EmissionReports";
import CreditWallet from "./pages/dashboard/CreditWallet";
import TransactionHistory from "./pages/dashboard/TransactionHistory";
import RegulatorDashboard from "./pages/dashboard/RegulatorDashboard";
import PendingReviews from "./pages/dashboard/PendingReviews";
import ApprovedReports from "./pages/dashboard/ApprovedReports";
import AuditLog from "./pages/dashboard/AuditLog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* /dashboard redirects to role-specific dashboard */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            {/* Company Routes */}
            <Route 
              path="/dashboard/company" 
              element={
                <ProtectedRoute requiredRole="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/company/reports" 
              element={
                <ProtectedRoute requiredRole="company">
                  <EmissionReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/company/wallet" 
              element={
                <ProtectedRoute requiredRole="company">
                  <CreditWallet />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/company/history" 
              element={
                <ProtectedRoute requiredRole="company">
                  <TransactionHistory />
                </ProtectedRoute>
              } 
            />
            {/* Regulator Routes */}
            <Route 
              path="/dashboard/regulator" 
              element={
                <ProtectedRoute requiredRole="regulator">
                  <RegulatorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/regulator/reviews" 
              element={
                <ProtectedRoute requiredRole="regulator">
                  <PendingReviews />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/regulator/approved" 
              element={
                <ProtectedRoute requiredRole="regulator">
                  <ApprovedReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/regulator/audit" 
              element={
                <ProtectedRoute requiredRole="regulator">
                  <AuditLog />
                </ProtectedRoute>
              } 
            />
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
