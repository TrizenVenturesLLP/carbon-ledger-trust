import { motion } from "framer-motion";
import { FileCheck, Clock, AlertCircle, CheckCircle, XCircle, Eye, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pendingReviews = [
  { 
    id: "RPT-004", 
    company: "Acme Corp", 
    title: "Q4 2023 Emission Reduction",
    submitted: "2024-01-15",
    credits: 150,
    priority: "high"
  },
  { 
    id: "RPT-005", 
    company: "GreenTech Industries", 
    title: "Wind Farm Installation",
    submitted: "2024-01-14",
    credits: 500,
    priority: "medium"
  },
  { 
    id: "RPT-006", 
    company: "EcoLogistics", 
    title: "Fleet Conversion Project",
    submitted: "2024-01-13",
    credits: 200,
    priority: "low"
  },
];

const recentActions = [
  { id: "ACT-001", action: "Approved", report: "Solar Panel Installation", company: "SunPower Ltd", credits: 300, timestamp: "2024-01-15 10:30" },
  { id: "ACT-002", action: "Rejected", report: "Carbon Capture Initiative", company: "FossilFree Inc", timestamp: "2024-01-14 16:45" },
  { id: "ACT-003", action: "Approved", report: "Reforestation Project", company: "GreenEarth NGO", credits: 1000, timestamp: "2024-01-14 09:15" },
];

export default function RegulatorDashboard() {
  return (
    <DashboardLayout role="regulator">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Regulator Dashboard
          </h1>
          <p className="text-muted-foreground">
            Review and verify emission reduction reports
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Reviews"
            value="12"
            subtitle="Reports awaiting review"
            icon={Clock}
          />
          <StatCard
            title="Approved This Month"
            value="47"
            subtitle="Credits: 15,200 tCO₂e"
            icon={CheckCircle}
          />
          <StatCard
            title="Rejected This Month"
            value="5"
            subtitle="Sent back for revision"
            icon={XCircle}
          />
          <StatCard
            title="Total Credits Issued"
            value="125K"
            subtitle="All time"
            icon={FileCheck}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pending Reviews Queue */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display">Pending Reviews</CardTitle>
              <CardDescription>Reports waiting for your verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 rounded-full p-2 ${
                          review.priority === "high" ? "bg-destructive/10" :
                          review.priority === "medium" ? "bg-warning/10" : "bg-muted"
                        }`}>
                          <FileText className={`h-4 w-4 ${
                            review.priority === "high" ? "text-destructive" :
                            review.priority === "medium" ? "text-warning" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{review.title}</p>
                            {review.priority === "high" && (
                              <StatusBadge status="rejected" icon={<AlertCircle className="h-3 w-3" />}>
                                High Priority
                              </StatusBadge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{review.company}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>ID: {review.id}</span>
                            <span>•</span>
                            <span>Submitted: {review.submitted}</span>
                            <span>•</span>
                            <span className="font-medium text-foreground">{review.credits} tCO₂e</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-col">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Recent Actions</CardTitle>
              <CardDescription>Your verification history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-2">
                      {action.action === "Approved" ? (
                        <CheckCircle className="mt-0.5 h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {action.action} "{action.report}"
                        </p>
                        <p className="text-xs text-muted-foreground">{action.company}</p>
                        {action.credits && (
                          <p className="text-xs font-medium text-success">
                            +{action.credits} credits issued
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">{action.timestamp}</p>
                      </div>
                    </div>
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
