import { motion } from "framer-motion";
import { Coins, ArrowUpRight, ArrowDownLeft, Clock, FileText, TrendingUp, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const recentTransactions: { id: string; type: string; amount: number; from?: string; to?: string; date: string; hash: string }[] = [];

const pendingReports: { id: string; title: string; submitted: string; status: "pending" | "approved" | "rejected" }[] = [];

export default function CompanyDashboard() {
  return (
    <DashboardLayout role="company">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Welcome back, Acme Corp
            </h1>
            <p className="text-muted-foreground">
              Here's your carbon credit overview
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Submit New Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Credits Owned"
            value="1,250"
            subtitle="tCO₂e"
            icon={Coins}
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Credits Traded"
            value="450"
            subtitle="Last 30 days"
            icon={ArrowUpRight}
          />
          <StatCard
            title="Credits Retired"
            value="325"
            subtitle="This year"
            icon={TrendingUp}
          />
          <StatCard
            title="Pending Verification"
            value="3"
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
                {recentTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${
                        tx.type === "received" ? "bg-success/10" : 
                        tx.type === "sent" ? "bg-info/10" : "bg-muted"
                      }`}>
                        {tx.type === "received" ? (
                          <ArrowDownLeft className="h-4 w-4 text-success" />
                        ) : tx.type === "sent" ? (
                          <ArrowUpRight className="h-4 w-4 text-info" />
                        ) : (
                          <Coins className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {tx.type === "received" && `Received from ${tx.from}`}
                          {tx.type === "sent" && `Sent to ${tx.to}`}
                          {tx.type === "retired" && "Credits Retired"}
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        tx.type === "received" ? "text-success" : 
                        tx.type === "sent" ? "text-info" : "text-muted-foreground"
                      }`}>
                        {tx.type === "received" ? "+" : tx.type === "sent" ? "-" : ""}{tx.amount} tCO₂e
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">{tx.hash}</p>
                    </div>
                  </motion.div>
                ))}
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
                {pendingReports.map((report, index) => (
                  <motion.div
                    key={report.id}
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
                        <p className="text-xs text-muted-foreground">Submitted: {report.submitted}</p>
                      </div>
                    </div>
                    <StatusBadge status={report.status}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </StatusBadge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
