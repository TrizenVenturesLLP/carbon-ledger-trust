import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  CheckCircle, 
  Building, 
  Calendar,
  Coins,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reviewsApi } from "@/api/reviews.api";
import { EmissionReport } from "@/api/reports.api";
import { format } from "date-fns";

export default function ApprovedReports() {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Fetch approved reports
  const { data: approvedReports = [], isLoading } = useQuery({
    queryKey: ['approvedReports'],
    queryFn: reviewsApi.getApprovedReports,
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const totalCreditsIssued = approvedReports.reduce((sum: number, r: EmissionReport) => sum + (r.issuedCredits || 0), 0);
  const uniqueCompanies = new Set(approvedReports.map((r: EmissionReport) => {
    const company = r.companyId as any;
    return company?.email || company?._id;
  })).size;

  return (
    <DashboardLayout role="regulator">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Approved Reports
          </h1>
          <p className="text-muted-foreground">
            View all verified and approved emission reduction reports
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedReports.length}</p>
                  <p className="text-xs text-muted-foreground">Approved Reports</p>
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
                  <p className="text-2xl font-bold">{totalCreditsIssued.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Credits Issued (tCO₂e)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary p-2">
                  <Building className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{uniqueCompanies}</p>
                  <p className="text-xs text-muted-foreground">Companies Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Verified Reports</CardTitle>
            <CardDescription>All approved reports with blockchain verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedReports.length > 0 ? (
                approvedReports.map((report: EmissionReport & { companyId?: { companyName?: string; email?: string }; reviewedBy?: { email?: string }; reviewedAt?: string | Date }, index) => {
                  const reportIdStr = report.reportId ?? report._id ?? '';
                  const companyName = typeof report.companyId === 'object' && report.companyId !== null
                    ? (report.companyId as { companyName?: string; email?: string }).companyName ?? (report.companyId as { email?: string }).email ?? ''
                    : String(report.companyId ?? '');
                  const approvedDateStr = report.reviewedAt
                    ? format(new Date(report.reviewedAt), 'MMM dd, yyyy')
                    : '';
                  const verifierStr = typeof report.reviewedBy === 'object' && report.reviewedBy !== null
                    ? (report.reviewedBy as { email?: string }).email ?? ''
                    : String(report.reviewedBy ?? '');
                  const txHash = report.blockchainTxHash ?? (report as any).txHash ?? '';
                  return (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-success/10 p-2">
                        <CheckCircle className="h-5 w-5 text-success" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{report.title}</p>
                          <StatusBadge status="approved">Verified</StatusBadge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {companyName}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>ID: {reportIdStr}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Approved: {approvedDateStr}
                          </span>
                          <span>•</span>
                          <span>By: {verifierStr}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-xl font-bold text-success">+{report.issuedCredits} tCO₂e</p>
                        <p className="text-xs text-muted-foreground">Credits Issued</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="max-w-[120px] truncate font-mono text-xs text-muted-foreground">
                          {txHash}
                        </span>
                        <button
                          onClick={() => txHash && handleCopyHash(txHash)}
                          className="rounded p-1 hover:bg-muted"
                        >
                          {copiedHash === txHash ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                  );
              })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No approved reports</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
