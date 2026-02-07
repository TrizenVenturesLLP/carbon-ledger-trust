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
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMetaMask } from "@/hooks/use-metamask";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "company" | "regulator";
}

const navItems = {
  company: [
    // { icon: LayoutDashboard, label: "Overview", href: "/dashboard/company" },
    { icon: FileText, label: "Emission Reports", href: "/dashboard/company/reports" },
    { icon: Wallet, label: "Credit Wallet", href: "/dashboard/company/wallet" },
    { icon: History, label: "Transaction History", href: "/dashboard/company/history" },
  ],
  regulator: [
    // { icon: LayoutDashboard, label: "Overview", href: "/dashboard/regulator" },
    { icon: CheckSquare, label: "Pending Reviews", href: "/dashboard/regulator/reviews" },
    { icon: FileCheck, label: "Approved Reports", href: "/dashboard/regulator/approved" },
    { icon: History, label: "Audit Log", href: "/dashboard/regulator/audit" },
  ],
};

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { isInstalled, isConnected, account, connect, disconnect, isLoading: isConnecting } = useMetaMask();

  const items = navItems[role];
  
  const getUserDisplayName = () => {
    if (user?.companyName) return user.companyName;
    if (user?.email) return user.email.split('@')[0];
    return role === "company" ? "Company" : "Regulator";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.substring(0, 2).toUpperCase();
  };

  const handleCopyWallet = async () => {
    if (user?.walletAddress) {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleConnectWallet = async () => {
    await connect();
    // Refresh user data after connecting
    await refreshUser();
  };

  const handleDisconnectWallet = async () => {
    try {
      // Disconnect MetaMask if connected
      if (isConnected) {
        disconnect();
      }
      
      // Unlink wallet from account
      const { authApi } = await import('@/api/auth.api');
      await authApi.unlinkWallet();
      
      // Refresh user data to reflect the unlinked state
      await refreshUser();
      
      toast({
        title: 'Wallet Unlinked',
        description: 'Your wallet has been unlinked from your account',
      });
    } catch (error: any) {
      console.error('Failed to unlink wallet:', error);
      toast({
        title: 'Failed to Unlink Wallet',
        description: error?.response?.data?.error || 'An error occurred while unlinking your wallet',
        variant: 'destructive',
      });
    }
  };

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
            <p className="text-sm font-semibold text-foreground">{getUserDisplayName()}</p>
            <p className="text-xs text-muted-foreground">{role === "company" ? "Company Dashboard" : "Regulator Dashboard"}</p>
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
            onClick={() => {
              logout();
              navigate("/login");
            }}
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
            {/* Wallet Status Badge - show for both company and regulator */}
            <div className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5",
              user?.walletAddress 
                ? "border-success/50 bg-success/10" 
                : "border-warning/50 bg-warning/10"
            )}>
              <div className={cn(
                "h-2 w-2 rounded-full",
                user?.walletAddress ? "bg-success animate-pulse" : "bg-warning"
              )} />
              <span className="text-xs font-medium text-muted-foreground">
                {user?.walletAddress ? "Wallet Linked" : "No Wallet"}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {getUserInitials()}
                    </span>
                  </div>
                  <span className="hidden sm:inline">{getUserDisplayName()}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{getUserDisplayName()}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Wallet Section - for both company and regulator */}
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Wallet
                </DropdownMenuLabel>
                {user?.walletAddress ? (
                  <>
                    <DropdownMenuItem
                      onClick={handleCopyWallet}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground truncate">
                          {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(38)}
                        </span>
                        <span className="text-xs text-success">Linked</span>
                      </div>
                      {copiedAddress ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDisconnectWallet}
                      className="cursor-pointer text-xs text-destructive focus:text-destructive"
                    >
                      Unlink Wallet
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={handleConnectWallet}
                    disabled={!isInstalled || isConnecting}
                    className="cursor-pointer"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    {isConnecting ? "Connecting..." : isInstalled ? "Connect Wallet" : "Install MetaMask"}
                  </DropdownMenuItem>
                )}
                {user?.walletAddress && isConnected && account && account.toLowerCase() !== user.walletAddress.toLowerCase() && (
                  <DropdownMenuItem className="text-xs text-warning">
                    MetaMask connected to different address
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
