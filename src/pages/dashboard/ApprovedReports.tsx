import { motion } from "framer-motion";
import { 
  CheckCircle, 
  FileText, 
  Building, 
  Calendar,
  Coins,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const approvedReports: { 
  id: string; 
  company: string;
  title: string; 
  approvedDate: string;
  submittedDate: string;
  issuedCredits: number;
  txHash: string;
  blockNumber: number;
  verifier: string;
}[] = [];

export default function ApprovedReports() {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const totalCreditsIssued = approvedReports.reduce((sum, r) => sum + r.issuedCredits, 0);

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
                  <p className="text-2xl font-bold">4</p>
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
              {approvedReports.map((report, index) => (
                <motion.div
                  key={report.id}
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
                          {report.company}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>ID: {report.id}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Approved: {report.approvedDate}
                          </span>
                          <span>•</span>
                          <span>By: {report.verifier}</span>
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
                          {report.txHash}
                        </span>
                        <button
                          onClick={() => handleCopyHash(report.txHash)}
                          className="rounded p-1 hover:bg-muted"
                        >
                          {copiedHash === report.txHash ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
                          <ExternalLink className="h-3 w-3" />
                          Verify
                        </Button>
                      </div>
                    </div>
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
