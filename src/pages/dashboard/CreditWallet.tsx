import { useState } from "react";
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

const credits: { 
  id: string; 
  amount: number; 
  issuer: string; 
  issuedDate: string; 
  project: string;
  status: "active" | "retired";
}[] = [];

export default function CreditWallet() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [retireDialogOpen, setRetireDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<typeof credits[0] | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalActive = credits.filter(c => c.status === "active").reduce((sum, c) => sum + c.amount, 0);
  const totalRetired = credits.filter(c => c.status === "retired").reduce((sum, c) => sum + c.amount, 0);

  const filteredCredits = credits.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.project.toLowerCase().includes(searchQuery.toLowerCase())
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
                <p className="text-2xl font-bold text-foreground">{totalActive + totalRetired} tCO₂e</p>
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
            <div className="space-y-4">
              {filteredCredits.map((credit, index) => (
                <motion.div
                  key={credit.id}
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
                          <p className="font-mono text-sm font-medium text-foreground">{credit.id}</p>
                          <button
                            onClick={() => handleCopy(credit.id)}
                            className="rounded p-1 hover:bg-muted"
                          >
                            {copiedId === credit.id ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                          <StatusBadge status={credit.status}>
                            {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-foreground">{credit.project}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>Issuer: {credit.issuer}</span>
                          <span>•</span>
                          <span>Issued: {credit.issuedDate}</span>
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
                          <Button variant="outline" size="sm">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            Transfer
                          </Button>
                          <Dialog open={retireDialogOpen && selectedCredit?.id === credit.id} onOpenChange={(open) => {
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
                              <div className="space-y-4 py-4">
                                <div className="rounded-lg border border-border bg-muted/50 p-4">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Credit ID</span>
                                    <span className="font-mono text-sm">{credit.id}</span>
                                  </div>
                                  <div className="mt-2 flex justify-between">
                                    <span className="text-sm text-muted-foreground">Amount</span>
                                    <span className="font-bold">{credit.amount} tCO₂e</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Retirement Reason</Label>
                                  <Input placeholder="e.g., Offsetting 2024 Q1 emissions" />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setRetireDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button variant="destructive" onClick={() => setRetireDialogOpen(false)}>
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
