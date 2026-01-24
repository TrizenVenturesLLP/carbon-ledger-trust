import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { reportsApi, EmissionReport } from "@/api/reports.api";
import { format } from "date-fns";

export default function EmissionReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<EmissionReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'quarterly' as 'quarterly' | 'project' | 'annual',
    methodology: '',
    description: '',
    baselineEmissions: '',
    reportedEmissions: '',
    estimatedCredits: '',
  });

  // Fetch reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: reportsApi.getReports,
  });

  // Submit report mutation
  const submitMutation = useMutation({
    mutationFn: reportsApi.submitReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setNewReportOpen(false);
      setSelectedFiles([]);
      toast({
        title: "Report Submitted",
        description: "Your emission reduction report has been submitted for verification.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.error || "Failed to submit report",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const reportData = {
      title: formData.title,
      type: formData.type,
      description: formData.description,
      methodology: formData.methodology,
      baselineEmissions: parseFloat(formData.baselineEmissions),
      reportedEmissions: parseFloat(formData.reportedEmissions),
      estimatedCredits: parseFloat(formData.estimatedCredits),
      documents: selectedFiles,
    };

    submitMutation.mutate(reportData);
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
                    <Input 
                      id="title" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Q1 2024 Emission Reduction" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Report Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({ ...formData, type: value as 'quarterly' | 'project' | 'annual' })}
                      required
                    >
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
                  <Label htmlFor="methodology">Methodology</Label>
                  <Input 
                    id="methodology" 
                    value={formData.methodology}
                    onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                    placeholder="e.g., GHG Protocol Corporate Standard" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the emission reduction activities and methodologies used..."
                    rows={4}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="baselineEmissions">Baseline Emissions (tCO₂e)</Label>
                    <Input 
                      id="baselineEmissions" 
                      type="number" 
                      step="0.01" 
                      value={formData.baselineEmissions}
                      onChange={(e) => setFormData({ ...formData, baselineEmissions: e.target.value })}
                      placeholder="e.g., 500" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportedEmissions">Reported Emissions (tCO₂e)</Label>
                    <Input 
                      id="reportedEmissions" 
                      type="number" 
                      step="0.01" 
                      value={formData.reportedEmissions}
                      onChange={(e) => setFormData({ ...formData, reportedEmissions: e.target.value })}
                      placeholder="e.g., 350" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedCredits">Estimated Credits (tCO₂e)</Label>
                  <Input 
                    id="estimatedCredits" 
                    type="number" 
                    step="0.01" 
                    value={formData.estimatedCredits}
                    onChange={(e) => setFormData({ ...formData, estimatedCredits: e.target.value })}
                    placeholder="e.g., 150" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Supporting Documents</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setSelectedFiles(files);
                    }}
                  />
                  <div 
                    className="rounded-lg border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, XLSX, CSV, Images up to 10MB each
                    </p>
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-1">
                        {selectedFiles.map((file, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground">{file.name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setNewReportOpen(false);
                    setSelectedFiles([]);
                    setFormData({
                      title: '',
                      type: 'quarterly',
                      methodology: '',
                      description: '',
                      baselineEmissions: '',
                      reportedEmissions: '',
                      estimatedCredits: '',
                    });
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitMutation.isPending}>
                    {submitMutation.isPending ? "Submitting..." : "Submit Report"}
                  </Button>
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
                  <p className="text-2xl font-bold">{reports.filter((r: EmissionReport) => r.status === "pending").length}</p>
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
                  <p className="text-2xl font-bold">{reports.filter((r: EmissionReport) => r.status === "approved").length}</p>
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
                  <p className="text-2xl font-bold">{reports.filter((r: EmissionReport) => r.status === "rejected").length}</p>
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
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading reports...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.length > 0 ? (
                  reports.map((report, index) => (
                    <motion.div
                      key={report._id}
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
                                Submitted: {format(new Date(report.submittedAt), "MMM dd, yyyy")}
                              </span>
                              <span>ID: {report.reportId}</span>
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
                                <DialogDescription>Report ID: {report.reportId}</DialogDescription>
                              </DialogHeader>
                              {selectedReport && (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <StatusBadge status={selectedReport.status}>
                                      {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                                    </StatusBadge>
                                    <span className="text-sm text-muted-foreground">{selectedReport.type}</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Description</p>
                                    <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Methodology</p>
                                    <p className="text-sm text-muted-foreground">{selectedReport.methodology}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Baseline Emissions</p>
                                      <p className="text-sm text-muted-foreground">{selectedReport.baselineEmissions} tCO₂e</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Reported Emissions</p>
                                      <p className="text-sm text-muted-foreground">{selectedReport.reportedEmissions} tCO₂e</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Submitted</p>
                                      <p className="text-sm text-muted-foreground">{format(new Date(selectedReport.submittedAt), "MMM dd, yyyy")}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Credits</p>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedReport.issuedCredits || selectedReport.estimatedCredits} tCO₂e
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium mb-2">Documents</p>
                                    <div className="space-y-2">
                                      {selectedReport.documents.length > 0 ? (
                                        selectedReport.documents.map((doc, idx) => (
                                          <div key={idx} className="flex items-center gap-2 rounded-lg bg-muted p-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{doc.originalName}</span>
                                            <a 
                                              href={`http://localhost:3000/${doc.path}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="ml-auto text-xs text-primary hover:underline"
                                            >
                                              Download
                                            </a>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-sm text-muted-foreground">No documents</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No emission reports</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
