import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins, ArrowUpRight, ArrowDownLeft, Clock, FileText, TrendingUp, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { reportsApi } from "@/api/reports.api";
import { creditsApi } from "@/api/credits.api";
import { transactionsApi } from "@/api/transactions.api";
import { format } from "date-fns";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch data
  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: reportsApi.getReports,
  });

  const { data: balance } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: creditsApi.getWalletBalance,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.getTransactions(),
  });

  const pendingReports = reports.filter((r: any) => r.status === "pending");
  const recentTransactions = transactions.slice(0, 3);
  const retiredCredits = balance?.retired || 0;

  return (
    <DashboardLayout role="company">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Welcome back, {user?.companyName || user?.email}
            </h1>
            <p className="text-muted-foreground">
              Here's your carbon credit overview
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/dashboard/company/reports")}>
            <Plus className="h-4 w-4" />
            Submit New Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Credits Owned"
            value={balance?.total.toLocaleString() || "0"}
            subtitle="tCO₂e"
            icon={Coins}
          />
          <StatCard
            title="Active Credits"
            value={balance?.active.toLocaleString() || "0"}
            subtitle="tCO₂e"
            icon={ArrowUpRight}
          />
          <StatCard
            title="Credits Retired"
            value={retiredCredits.toLocaleString()}
            subtitle="tCO₂e"
            icon={TrendingUp}
          />
          <StatCard
            title="Pending Verification"
            value={pendingReports.length.toString()}
            subtitle="Reports"
            icon={Clock}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Recent Transactions</CardTitle>
              <CardDescription>Your latest carbon credit movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx: any, index: number) => {
                    const toUser = tx.toUserId as any;
                    const fromUser = tx.fromUserId as any;
                    
                    return (
                      <motion.div
                        key={tx._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full p-2 ${
                            tx.type === "received" || tx.type === "issued" ? "bg-success/10" : 
                            tx.type === "sent" ? "bg-info/10" : "bg-muted"
                          }`}>
                            {tx.type === "received" || tx.type === "issued" ? (
                              <ArrowDownLeft className="h-4 w-4 text-success" />
                            ) : tx.type === "sent" ? (
                              <ArrowUpRight className="h-4 w-4 text-info" />
                            ) : (
                              <Coins className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {tx.type === "issued" && "Credits Issued"}
                              {tx.type === "received" && `Received from ${toUser?.companyName || toUser?.email || 'Unknown'}`}
                              {tx.type === "sent" && `Sent to ${toUser?.companyName || toUser?.email || 'Unknown'}`}
                              {tx.type === "retired" && "Credits Retired"}
                            </p>
                            <p className="text-xs text-muted-foreground">{format(new Date(tx.createdAt), "MMM dd, yyyy")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            tx.type === "received" || tx.type === "issued" ? "text-success" : 
                            tx.type === "sent" ? "text-info" : "text-muted-foreground"
                          }`}>
                            {tx.type === "received" || tx.type === "issued" ? "+" : tx.type === "sent" ? "-" : ""}{tx.amount} tCO₂e
                          </p>
                          {tx.blockchainTxHash && (
                            <p className="text-xs font-mono text-muted-foreground">{tx.blockchainTxHash.substring(0, 10)}...</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent transactions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emission Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Emission Reports</CardTitle>
              <CardDescription>Track your verification status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReports.length > 0 ? (
                  pendingReports.map((report: any, index: number) => (
                    <motion.div
                      key={report._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{report.title}</p>
                          <p className="text-xs text-muted-foreground">Submitted: {format(new Date(report.submittedAt), "MMM dd, yyyy")}</p>
                        </div>
                      </div>
                      <StatusBadge status={report.status}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </StatusBadge>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No emission reports</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
