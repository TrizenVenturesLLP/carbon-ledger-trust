import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf,
  LayoutDashboard,
  FileText,
  Wallet,
  History,
  CheckSquare,
  LogOut,
  Menu,
  ChevronDown,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "company" | "regulator";
}

const navItems = {
  company: [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard/company" },
    { icon: FileText, label: "Emission Reports", href: "/dashboard/company/reports" },
    { icon: Wallet, label: "Credit Wallet", href: "/dashboard/company/wallet" },
    { icon: History, label: "Transaction History", href: "/dashboard/company/history" },
  ],
  regulator: [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard/regulator" },
    { icon: CheckSquare, label: "Pending Reviews", href: "/dashboard/regulator/reviews" },
    { icon: FileCheck, label: "Approved Reports", href: "/dashboard/regulator/approved" },
    { icon: History, label: "Audit Log", href: "/dashboard/regulator/audit" },
  ],
};

const roleLabels = {
  company: { title: "Company Dashboard", user: "Acme Corp" },
  regulator: { title: "Regulator Dashboard", user: "EPA Verifier" },
};

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = navItems[role];
  const roleInfo = roleLabels[role];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transform border-r border-border bg-card transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="rounded-lg bg-primary p-2">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold text-foreground">
            CarbonLedger
          </span>
        </div>

        <div className="p-4">
          <div className="mb-4 rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground">Logged in as</p>
            <p className="text-sm font-semibold text-foreground">{roleInfo.user}</p>
            <p className="text-xs text-muted-foreground">{roleInfo.title}</p>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/login")}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-sm lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-foreground">
              {items.find((item) => item.href === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">Connected</span>
            </div>
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {role === "company" ? "AC" : "EP"}
                </span>
              </div>
              <span className="hidden sm:inline">{roleInfo.user}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
