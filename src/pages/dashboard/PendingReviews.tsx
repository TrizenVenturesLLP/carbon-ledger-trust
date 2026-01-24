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

const allPendingReviews = [];

export default function PendingReviews() {
  const { toast } = useToast();
  const [selectedReview, setSelectedReview] = useState<typeof allPendingReviews[0] | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = () => {
    toast({
      title: "Report Approved",
      description: `${selectedReview?.credits} carbon credits have been issued to ${selectedReview?.company}`,
    });
    setReviewDialogOpen(false);
  };

  const handleReject = () => {
    toast({
      title: "Report Rejected",
      description: `Feedback has been sent to ${selectedReview?.company}`,
      variant: "destructive",
    });
    setRejectDialogOpen(false);
    setReviewDialogOpen(false);
    setRejectionReason("");
  };

  const totalPendingCredits = allPendingReviews.reduce((sum, r) => sum + r.credits, 0);
  const highPriority = allPendingReviews.filter(r => r.priority === "high").length;

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
                  <p className="text-2xl font-bold">{new Set(allPendingReviews.map(r => r.company)).size}</p>
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
            <div className="space-y-4">
              {allPendingReviews.length > 0 ? (
                allPendingReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 rounded-lg p-2 ${
                        review.priority === "high" ? "bg-destructive/10" :
                        review.priority === "medium" ? "bg-warning/10" : "bg-muted"
                      }`}>
                        <FileText className={`h-5 w-5 ${
                          review.priority === "high" ? "text-destructive" :
                          review.priority === "medium" ? "text-warning" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{review.title}</p>
                          {review.priority === "high" && (
                            <StatusBadge status="rejected" icon={<AlertCircle className="h-3 w-3" />}>
                              High Priority
                            </StatusBadge>
                          )}
                          {review.priority === "medium" && (
                            <StatusBadge status="pending">
                              Medium
                            </StatusBadge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {review.company}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>ID: {review.id}</span>
                          <span>•</span>
                          <span>Submitted: {review.submitted}</span>
                          <span>•</span>
                          <span>{review.methodology}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">{review.credits} tCO₂e</p>
                        <p className="text-xs text-muted-foreground">Claimed Credits</p>
                      </div>
                      <Button 
                        className="gap-1"
                        onClick={() => {
                          setSelectedReview(review);
                          setReviewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending reviews</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
