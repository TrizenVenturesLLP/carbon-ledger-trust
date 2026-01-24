import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Building
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { reviewsApi } from "@/api/reviews.api";
import { auditApi } from "@/api/audit.api";
import { EmissionReport } from "@/api/reports.api";
import { format } from "date-fns";

export default function RegulatorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch data
  const { data: pendingReviews = [] } = useQuery({
    queryKey: ['pendingReviews'],
    queryFn: reviewsApi.getPendingReviews,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => auditApi.getAuditLogs(),
  });

  const recentActions = auditLogs.slice(0, 4);

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
            value={pendingReviews.length.toString()}
            subtitle="Reports awaiting review"
            icon={Clock}
          />
          <StatCard
            title="Approved This Month"
            value={auditLogs.filter((l: any) => l.action === "approved").length.toString()}
            subtitle="Reports approved"
            icon={CheckCircle}
          />
          <StatCard
            title="Rejected This Month"
            value={auditLogs.filter((l: any) => l.action === "rejected").length.toString()}
            subtitle="Sent back for revision"
            icon={XCircle}
          />
          <StatCard
            title="Total Credits Issued"
            value={auditLogs.reduce((sum: number, l: any) => sum + (l.creditsIssued || 0), 0).toLocaleString()}
            subtitle="tCO₂e"
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
                {pendingReviews.length > 0 ? (
                  pendingReviews.slice(0, 3).map((review: EmissionReport, index: number) => {
                    const company = review.companyId as any;
                    return (
                      <motion.div
                        key={review._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-lg border border-border bg-card p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 rounded-full p-2 bg-warning/10">
                              <FileText className="h-4 w-4 text-warning" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">{review.title}</p>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {company?.companyName || company?.email || 'Unknown Company'}
                              </p>
                              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                <span>ID: {review.reportId}</span>
                                <span>•</span>
                                <span>Submitted: {format(new Date(review.submittedAt), "MMM dd, yyyy")}</span>
                                <span>•</span>
                                <span className="font-medium text-foreground">{review.estimatedCredits} tCO₂e</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => navigate("/dashboard/regulator/reviews")}
                          >
                            <Eye className="h-3 w-3" />
                            Review
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending reviews</p>
                  </div>
                )}
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
                {recentActions.length > 0 ? (
                  recentActions.map((action: any, index: number) => (
                    <motion.div
                      key={action._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-2">
                        {action.action === "approved" ? (
                          <CheckCircle className="mt-0.5 h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {action.action.charAt(0).toUpperCase() + action.action.slice(1)} "{action.reportTitle}"
                          </p>
                          <p className="text-xs text-muted-foreground">{action.companyName}</p>
                          {action.creditsIssued && (
                            <p className="text-xs font-medium text-success">
                              +{action.creditsIssued} credits issued
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">{format(new Date(action.timestamp), "MMM dd, yyyy 'at' HH:mm")}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent actions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedReview?.title}
                {selectedReview?.priority === "high" && (
                  <StatusBadge status="rejected" icon={<AlertCircle className="h-3 w-3" />}>
                    High Priority
                  </StatusBadge>
                )}
              </DialogTitle>
              <DialogDescription>
                Report ID: {selectedReview?.id} • Submitted by {selectedReview?.company}
              </DialogDescription>
            </DialogHeader>
            
            {selectedReview && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Baseline Emissions</p>
                    <p className="text-xl font-bold">{selectedReview.baselineEmissions} tCO₂e</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Reported Emissions</p>
                    <p className="text-xl font-bold">{selectedReview.reportedEmissions} tCO₂e</p>
                  </div>
                  <div className="rounded-lg bg-success/10 p-4">
                    <p className="text-xs text-muted-foreground">Claimed Credits</p>
                    <p className="text-xl font-bold text-success">{selectedReview.credits} tCO₂e</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedReview.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Methodology</p>
                    <p className="text-sm text-muted-foreground">{selectedReview.methodology}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Supporting Documents</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {selectedReview.documents.map((doc) => (
                        <div key={doc} className="flex items-center gap-2 rounded-lg bg-muted p-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm flex-1">{doc}</span>
                          <Button variant="ghost" size="sm" className="h-7">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setRejectDialogOpen(true)}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Reject Report
                  </Button>
                  <Button
                    variant="success"
                    className="gap-2 bg-success text-success-foreground hover:bg-success/90"
                    onClick={handleApprove}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Approve & Issue {selectedReview.credits} Credits
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Report</DialogTitle>
              <DialogDescription>
                Provide feedback explaining why this report was rejected.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain what information is missing or incorrect..."
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
