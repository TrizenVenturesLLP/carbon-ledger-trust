import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import CompanyDashboard from "./pages/dashboard/CompanyDashboard";
import EmissionReports from "./pages/dashboard/EmissionReports";
import CreditWallet from "./pages/dashboard/CreditWallet";
import TransactionHistory from "./pages/dashboard/TransactionHistory";
import RegulatorDashboard from "./pages/dashboard/RegulatorDashboard";
import PendingReviews from "./pages/dashboard/PendingReviews";
import ApprovedReports from "./pages/dashboard/ApprovedReports";
import AuditLog from "./pages/dashboard/AuditLog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          {/* Company Routes */}
          <Route path="/dashboard/company" element={<CompanyDashboard />} />
          <Route path="/dashboard/company/reports" element={<EmissionReports />} />
          <Route path="/dashboard/company/wallet" element={<CreditWallet />} />
          <Route path="/dashboard/company/history" element={<TransactionHistory />} />
          {/* Regulator Routes */}
          <Route path="/dashboard/regulator" element={<RegulatorDashboard />} />
          <Route path="/dashboard/regulator/reviews" element={<PendingReviews />} />
          <Route path="/dashboard/regulator/approved" element={<ApprovedReports />} />
          <Route path="/dashboard/regulator/audit" element={<AuditLog />} />
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
