import { motion } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Clock,
  Coins,
  User,
  Filter,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const auditLogs = [
  { 
    id: "LOG-001",
    action: "approved",
    reportId: "RPT-2024-002",
    reportTitle: "Solar Panel Installation",
    company: "Acme Corp",
    credits: 300,
    verifier: "John Smith",
    timestamp: "2024-01-15 10:30:45",
    notes: "All documentation verified. Baseline calculations confirmed.",
  },
  { 
    id: "LOG-002",
    action: "rejected",
    reportId: "RPT-2024-003",
    reportTitle: "Carbon Capture Initiative",
    company: "FossilFree Inc",
    verifier: "Jane Doe",
    timestamp: "2024-01-14 16:45:22",
    notes: "Insufficient monitoring data provided. Requested additional sensor readings.",
  },
  { 
    id: "LOG-003",
    action: "approved",
    reportId: "RPT-2024-001",
    reportTitle: "Reforestation Project",
    company: "GreenEarth NGO",
    credits: 1000,
    verifier: "John Smith",
    timestamp: "2024-01-14 09:15:10",
    notes: "Satellite imagery and ground surveys verified. Credits issued as per Gold Standard methodology.",
  },
  { 
    id: "LOG-004",
    action: "approved",
    reportId: "RPT-2023-098",
    reportTitle: "Biogas Plant Operation",
    company: "AgriGreen Ltd",
    credits: 450,
    verifier: "Jane Doe",
    timestamp: "2024-01-13 14:20:33",
    notes: "Methane capture rates confirmed via flow meters. Third-party audit completed.",
  },
  { 
    id: "LOG-005",
    action: "reviewed",
    reportId: "RPT-2024-004",
    reportTitle: "Wind Farm Installation",
    company: "GreenTech Industries",
    verifier: "John Smith",
    timestamp: "2024-01-13 11:05:18",
    notes: "Initial review completed. Requested clarification on grid connection dates.",
  },
  { 
    id: "LOG-006",
    action: "rejected",
    reportId: "RPT-2023-095",
    reportTitle: "Emission Reduction Claims",
    company: "QuickCarbon Ltd",
    verifier: "Jane Doe",
    timestamp: "2024-01-12 15:30:00",
    notes: "Baseline data inconsistent with industry standards. Methodology not recognized.",
  },
];

type ActionFilter = "all" | "approved" | "rejected" | "reviewed";

export default function AuditLog() {
  const [filter, setFilter] = useState<ActionFilter>("all");

  const filteredLogs = filter === "all" 
    ? auditLogs 
    : auditLogs.filter(log => log.action === filter);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "approved": return <CheckCircle className="h-4 w-4 text-success" />;
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      case "reviewed": return <Clock className="h-4 w-4 text-warning" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "approved": return "bg-success/10 text-success";
      case "rejected": return "bg-destructive/10 text-destructive";
      case "reviewed": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout role="regulator">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Audit Log
            </h1>
            <p className="text-muted-foreground">
              Complete verification history and decision trail
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={filter} onValueChange={(value) => setFilter(value as ActionFilter)}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="reviewed">In Review</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{auditLogs.length}</p>
                  <p className="text-xs text-muted-foreground">Total Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{auditLogs.filter(l => l.action === "approved").length}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{auditLogs.filter(l => l.action === "rejected").length}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {auditLogs.filter(l => l.credits).reduce((sum, l) => sum + (l.credits || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Credits Issued</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Verification History</CardTitle>
            <CardDescription>
              {filteredLogs.length} entries found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-2 ${getActionColor(log.action).split(' ')[0]}`}>
                        {getActionIcon(log.action)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-sm font-medium text-foreground">{log.reportTitle}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.company}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>Report: {log.reportId}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.verifier}
                          </span>
                          <span>•</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground italic">
                          "{log.notes}"
                        </p>
                      </div>
                    </div>
                    {log.credits && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-success">+{log.credits} tCO₂e</p>
                        <p className="text-xs text-muted-foreground">Credits Issued</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
