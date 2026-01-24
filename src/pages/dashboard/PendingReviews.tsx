import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { reviewsApi } from "@/api/reviews.api";
import { EmissionReport } from "@/api/reports.api";
import { format } from "date-fns";

export default function PendingReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<EmissionReport | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [issuedCredits, setIssuedCredits] = useState("");

  // Fetch pending reviews
  const { data: allPendingReviews = [], isLoading } = useQuery({
    queryKey: ['pendingReviews'],
    queryFn: reviewsApi.getPendingReviews,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { issuedCredits?: number; notes?: string } }) =>
      reviewsApi.approveReport(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      setReviewDialogOpen(false);
      setIssuedCredits("");
      toast({
        title: "Report Approved",
        description: `Credits have been issued on blockchain. Transaction: ${data.blockchainTxHash?.substring(0, 10)}...`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.response?.data?.error || "Failed to approve report",
        variant: "destructive",
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { rejectionReason: string; notes?: string } }) =>
      reviewsApi.rejectReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingReviews'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setRejectDialogOpen(false);
      setReviewDialogOpen(false);
      setRejectionReason("");
      toast({
        title: "Report Rejected",
        description: "Feedback has been sent to the company",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.response?.data?.error || "Failed to reject report",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    if (!selectedReview) return;
    
    const credits = issuedCredits ? parseFloat(issuedCredits) : selectedReview.estimatedCredits;
    approveMutation.mutate({
      id: selectedReview._id,
      data: {
        issuedCredits: credits,
        notes: `Approved by regulator. Issued ${credits} tCO₂e credits.`,
      },
    });
  };

  const handleReject = () => {
    if (!selectedReview || !rejectionReason) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    rejectMutation.mutate({
      id: selectedReview._id,
      data: {
        rejectionReason,
        notes: rejectionReason,
      },
    });
  };

  const totalPendingCredits = allPendingReviews.reduce((sum, r) => sum + (r.estimatedCredits || 0), 0);
  const uniqueCompanies = new Set(allPendingReviews.map((r: EmissionReport) => {
    const company = r.companyId as any;
    return company?.email || company?._id;
  })).size;

  return (
    <DashboardLayout role="regulator">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Pending Reviews
          </h1>
          <p className="text-muted-foreground">
            All reports awaiting your verification
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allPendingReviews.length}</p>
                  <p className="text-xs text-muted-foreground">Pending Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{highPriority}</p>
                  <p className="text-xs text-muted-foreground">High Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPendingCredits.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Pending Credits</p>
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
                  <p className="text-xs text-muted-foreground">Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Review Queue</CardTitle>
            <CardDescription>Click on a report to review and take action</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading reviews...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allPendingReviews.length > 0 ? (
                  allPendingReviews.map((review: EmissionReport, index: number) => {
                    const company = review.companyId as any;
                    return (
                      <motion.div
                        key={review._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="mt-1 rounded-lg p-2 bg-warning/10">
                              <FileText className="h-5 w-5 text-warning" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-foreground">{review.title}</p>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {company?.companyName || company?.email || 'Unknown Company'}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span>ID: {review.reportId}</span>
                                <span>•</span>
                                <span>Submitted: {format(new Date(review.submittedAt), "MMM dd, yyyy")}</span>
                                <span>•</span>
                                <span>{review.methodology}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xl font-bold text-foreground">{review.estimatedCredits} tCO₂e</p>
                              <p className="text-xs text-muted-foreground">Claimed Credits</p>
                            </div>
                            <Button 
                              className="gap-1"
                              onClick={() => {
                                setSelectedReview(review);
                                setIssuedCredits(review.estimatedCredits.toString());
                                setReviewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              Review
                            </Button>
                          </div>
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
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedReview?.title}</DialogTitle>
              <DialogDescription>
                Report ID: {selectedReview?.reportId} • Submitted by {(selectedReview?.companyId as any)?.companyName || (selectedReview?.companyId as any)?.email}
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
                    <p className="text-xl font-bold text-success">{selectedReview.estimatedCredits} tCO₂e</p>
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
                      {selectedReview.documents.length > 0 ? (
                        selectedReview.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-2 rounded-lg bg-muted p-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm flex-1">{doc.originalName}</span>
                            <a 
                              href={`http://localhost:3000/${doc.path}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              View
                            </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No documents</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Credits to Issue */}
                <div className="space-y-2">
                  <Label htmlFor="issuedCredits">Credits to Issue (tCO₂e)</Label>
                  <Input
                    id="issuedCredits"
                    type="number"
                    step="0.01"
                    value={issuedCredits}
                    onChange={(e) => setIssuedCredits(e.target.value)}
                    placeholder={selectedReview.estimatedCredits.toString()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: {selectedReview.estimatedCredits} tCO₂e (estimated by company)
                  </p>
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
                    disabled={approveMutation.isPending}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {approveMutation.isPending 
                      ? "Processing..." 
                      : `Approve & Issue ${issuedCredits || selectedReview.estimatedCredits} Credits`}
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
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectionReason}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {rejectMutation.isPending ? "Sending..." : "Send Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
