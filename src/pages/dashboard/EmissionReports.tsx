import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Calendar, Building, CheckCircle, XCircle, Clock, Plus, Eye } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const reports: { 
  id: string; 
  title: string; 
  type: string;
  submitted: string;
  status: "pending" | "approved" | "rejected";
  estimatedCredits: number;
  issuedCredits?: number;
  description: string;
  documents: string[];
  rejectionReason?: string;
}[] = [];

export default function EmissionReports() {
  const { toast } = useToast();
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<typeof reports[0] | null>(null);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setNewReportOpen(false);
    toast({
      title: "Report Submitted",
      description: "Your emission reduction report has been submitted for verification.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-success" />;
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  return (
    <DashboardLayout role="company">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Emission Reports
            </h1>
            <p className="text-muted-foreground">
              Submit and track your emission reduction reports
            </p>
          </div>
          
          <Dialog open={newReportOpen} onOpenChange={setNewReportOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Submit New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Emission Reduction Report</DialogTitle>
                <DialogDescription>
                  Provide details about your emission reduction project for verification.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title</Label>
                    <Input id="title" placeholder="e.g., Q1 2024 Emission Reduction" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Report Type</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quarterly">Quarterly Report</SelectItem>
                        <SelectItem value="project">Project Report</SelectItem>
                        <SelectItem value="annual">Annual Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the emission reduction activities and methodologies used..."
                    rows={4}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="credits">Estimated Credits (tCO₂e)</Label>
                    <Input id="credits" type="number" placeholder="e.g., 150" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period">Reporting Period</Label>
                    <Input id="period" placeholder="e.g., Jan 2024 - Mar 2024" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Supporting Documents</Label>
                  <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, XLSX, CSV up to 10MB each
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-3">
                      Browse Files
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setNewReportOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Report</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reports.length}</p>
                  <p className="text-xs text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === "pending").length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
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
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === "approved").length}</p>
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
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === "rejected").length}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">All Reports</CardTitle>
            <CardDescription>View and manage your emission reduction reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 rounded-lg p-2 ${
                        report.status === "approved" ? "bg-success/10" :
                        report.status === "rejected" ? "bg-destructive/10" : "bg-warning/10"
                      }`}>
                        {getStatusIcon(report.status)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{report.title}</p>
                          <StatusBadge status={report.status}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {report.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Submitted: {report.submitted}
                          </span>
                          <span>ID: {report.id}</span>
                        </div>
                        {report.status === "rejected" && report.rejectionReason && (
                          <div className="mt-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                            <strong>Rejection Reason:</strong> {report.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {report.status === "approved" ? "Issued Credits" : "Estimated Credits"}
                        </p>
                        <p className="text-xl font-bold text-foreground">
                          {report.issuedCredits || report.estimatedCredits} tCO₂e
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                            <Eye className="mr-1 h-3 w-3" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{report.title}</DialogTitle>
                            <DialogDescription>Report ID: {report.id}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={report.status}>
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </StatusBadge>
                              <span className="text-sm text-muted-foreground">{report.type}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Description</p>
                              <p className="text-sm text-muted-foreground">{report.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Submitted</p>
                                <p className="text-sm text-muted-foreground">{report.submitted}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Credits</p>
                                <p className="text-sm text-muted-foreground">
                                  {report.issuedCredits || report.estimatedCredits} tCO₂e
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Documents</p>
                              <div className="space-y-2">
                                {report.documents.map((doc) => (
                                  <div key={doc} className="flex items-center gap-2 rounded-lg bg-muted p-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{doc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
