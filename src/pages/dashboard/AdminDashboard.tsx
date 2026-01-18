import { motion } from "framer-motion";
import { 
  Coins, 
  Building2, 
  Users, 
  Activity, 
  TrendingUp, 
  Lock,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const recentActivity = [
  { type: "issue", description: "300 credits issued to SunPower Ltd", timestamp: "2 mins ago", hash: "0x1a2b...3c4d" },
  { type: "transfer", description: "150 credits transferred Acme → GreenTech", timestamp: "15 mins ago", hash: "0x5e6f...7g8h" },
  { type: "retire", description: "50 credits retired by EcoLogistics", timestamp: "1 hour ago", hash: "0x9i0j...1k2l" },
  { type: "register", description: "New company registered: CleanAir Inc", timestamp: "2 hours ago", hash: "0xm3n4...o5p6" },
  { type: "issue", description: "1000 credits issued to GreenEarth NGO", timestamp: "3 hours ago", hash: "0xq7r8...s9t0" },
];

const topCompanies = [
  { name: "GreenEarth NGO", credits: 12500, status: "active" as const },
  { name: "SunPower Ltd", credits: 8750, status: "active" as const },
  { name: "Acme Corp", credits: 6200, status: "active" as const },
  { name: "EcoLogistics", credits: 4100, status: "active" as const },
];

const systemHealth = [
  { label: "Blockchain Node", status: "operational", uptime: "99.99%" },
  { label: "Database", status: "operational", uptime: "99.95%" },
  { label: "API Gateway", status: "operational", uptime: "99.98%" },
  { label: "Smart Contracts", status: "operational", uptime: "100%" },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            System-wide overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Credits Issued"
            value="1.2M"
            subtitle="tCO₂e"
            icon={Coins}
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            title="Active Companies"
            value="156"
            subtitle="Registered organizations"
            icon={Building2}
          />
          <StatCard
            title="Credits Retired"
            value="450K"
            subtitle="Permanently offset"
            icon={Lock}
          />
          <StatCard
            title="Active Regulators"
            value="12"
            subtitle="Verification authority"
            icon={Users}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Feed */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display">Platform Activity</CardTitle>
                <CardDescription>Real-time blockchain events</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-3 w-3" />
                Explorer
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className={`rounded-full p-2 ${
                      activity.type === "issue" ? "bg-success/10" :
                      activity.type === "transfer" ? "bg-info/10" :
                      activity.type === "retire" ? "bg-muted" : "bg-primary/10"
                    }`}>
                      {activity.type === "issue" && <ArrowDownLeft className="h-4 w-4 text-success" />}
                      {activity.type === "transfer" && <ArrowUpRight className="h-4 w-4 text-info" />}
                      {activity.type === "retire" && <Lock className="h-4 w-4 text-muted-foreground" />}
                      {activity.type === "register" && <Building2 className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.timestamp}</span>
                        <span>•</span>
                        <span className="font-mono">{activity.hash}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Top Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Top Companies</CardTitle>
                <CardDescription>By carbon credit holdings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCompanies.map((company, index) => (
                    <div key={company.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground">{company.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {company.credits.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">System Health</CardTitle>
                <CardDescription>Infrastructure status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemHealth.map((service) => (
                    <div key={service.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        <span className="text-sm text-foreground">{service.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{service.uptime}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
