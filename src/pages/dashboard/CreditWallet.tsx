import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Coins, 
  ArrowUpRight, 
  Lock, 
  Copy, 
  Check, 
  ExternalLink,
  Search
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { creditsApi, CarbonCredit } from "@/api/credits.api";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function CreditWallet() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [retireDialogOpen, setRetireDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);

  // Fetch credits
  const { data: credits = [], isLoading: creditsLoading } = useQuery({
    queryKey: ['credits'],
    queryFn: () => creditsApi.getCredits(),
  });

  // Fetch wallet balance
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: creditsApi.getWalletBalance,
  });

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalActive = balance?.active || 0;
  const totalRetired = balance?.retired || 0;

  const filteredCredits = credits.filter((c: CarbonCredit) => 
    c.creditId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.reportId?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="company">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Carbon Credit Wallet
          </h1>
          <p className="text-muted-foreground">
            Manage your carbon credits and view detailed information
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-success/10 p-3">
                <Coins className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Credits</p>
                <p className="text-2xl font-bold text-foreground">{totalActive} tCO₂e</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-muted p-3">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retired Credits</p>
                <p className="text-2xl font-bold text-foreground">{totalRetired} tCO₂e</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-primary/10 p-3">
                <ArrowUpRight className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold text-foreground">{balance?.total || 0} tCO₂e</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credits List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-display">Your Credits</CardTitle>
                <CardDescription>View and manage individual carbon credits</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search credits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {creditsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading credits...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCredits.length > 0 ? (
                  filteredCredits.map((credit: CarbonCredit, index: number) => (
                    <motion.div
                      key={credit._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-xl border p-4 transition-all ${
                        credit.status === "retired" 
                          ? "border-border bg-muted/50" 
                          : "border-border bg-card hover:border-primary/30 hover:shadow-md"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`rounded-xl p-3 ${
                            credit.status === "retired" ? "bg-muted" : "bg-primary/10"
                          }`}>
                            {credit.status === "retired" ? (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Coins className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-sm font-medium text-foreground">{credit.creditId}</p>
                              <button
                                onClick={() => handleCopy(credit.creditId)}
                                className="rounded p-1 hover:bg-muted"
                              >
                                {copiedId === credit.creditId ? (
                                  <Check className="h-3 w-3 text-success" />
                                ) : (
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                )}
                              </button>
                              <StatusBadge status={credit.status}>
                                {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                              </StatusBadge>
                            </div>
                            <p className="text-sm text-foreground">{credit.reportId?.title || 'N/A'}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>Issued: {format(new Date(credit.issuedAt), "MMM dd, yyyy")}</span>
                              {credit.tokenId && (
                                <>
                                  <span>•</span>
                                  <span>Token ID: {credit.tokenId}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">{credit.amount}</p>
                            <p className="text-xs text-muted-foreground">tCO₂e</p>
                          </div>
                          {credit.status === "active" && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" disabled>
                                <ArrowUpRight className="mr-1 h-3 w-3" />
                                Transfer
                              </Button>
                              <Dialog open={retireDialogOpen && selectedCredit?._id === credit._id} onOpenChange={(open) => {
                                setRetireDialogOpen(open);
                                if (open) setSelectedCredit(credit);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="secondary" size="sm">
                                    <Lock className="mr-1 h-3 w-3" />
                                    Retire
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Retire Carbon Credits</DialogTitle>
                                    <DialogDescription>
                                      This action is permanent and cannot be undone. Retired credits will be permanently 
                                      removed from circulation and recorded on the blockchain.
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedCredit && (
                                    <div className="space-y-4 py-4">
                                      <div className="rounded-lg border border-border bg-muted/50 p-4">
                                        <div className="flex justify-between">
                                          <span className="text-sm text-muted-foreground">Credit ID</span>
                                          <span className="font-mono text-sm">{selectedCredit.creditId}</span>
                                        </div>
                                        <div className="mt-2 flex justify-between">
                                          <span className="text-sm text-muted-foreground">Amount</span>
                                          <span className="font-bold">{selectedCredit.amount} tCO₂e</span>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Retirement Reason</Label>
                                        <Input placeholder="e.g., Offsetting 2024 Q1 emissions" />
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setRetireDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => {
                                      toast({ title: "Retirement", description: "Credit retirement will be implemented with blockchain integration" });
                                      setRetireDialogOpen(false);
                                    }}>
                                      Confirm Retirement
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                          {credit.status === "retired" && (
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ExternalLink className="h-3 w-3" />
                              View on Chain
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No carbon credits found</p>
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
