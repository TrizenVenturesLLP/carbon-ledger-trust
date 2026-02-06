import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Coins, 
  ArrowUpRight, 
  Lock, 
  Copy, 
  Check, 
  ExternalLink,
  Search,
  Wallet,
  AlertCircle
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { creditsApi, CarbonCredit } from "@/api/credits.api";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useCarbonCreditContract } from "@/hooks/use-carbon-credit-contract";
import { useAuth } from "@/context/AuthContext";
import { useMetaMask } from "@/hooks/use-metamask";

export default function CreditWallet() {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const { transferCreditOnChain, retireCreditOnChain } = useCarbonCreditContract();
  const { isInstalled, isConnected, account, connect, isLoading: isConnecting } = useMetaMask();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [retireDialogOpen, setRetireDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [retirementReason, setRetirementReason] = useState("");
  const [transferWalletAddress, setTransferWalletAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isRetiring, setIsRetiring] = useState(false);

  const handleConnectWallet = async () => {
    await connect();
    // Refresh user data after connecting
    await refreshUser();
  };

  const handleCopyWallet = async () => {
    if (user?.walletAddress) {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

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

  const handleTransfer = async () => {
    if (!selectedCredit || !transferWalletAddress) {
      toast({
        title: "Error",
        description: "Please enter a wallet address",
        variant: "destructive",
      });
      return;
    }
    if (!selectedCredit.tokenId) {
      toast({
        title: "Error",
        description: "This credit does not have an associated token ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTransferring(true);
      // 1) Execute on-chain transfer with MetaMask (will trigger popup)
      const { txHash } = await transferCreditOnChain(selectedCredit.tokenId, transferWalletAddress);

      // 2) Record transfer in backend (DB + transaction history)
      await creditsApi.transferCredit(selectedCredit._id, {
        toWalletAddress: transferWalletAddress,
        blockchainTxHash: txHash,
      });

      toast({
        title: "Transfer Successful",
        description: `Transaction: ${txHash.substring(0, 10)}...`,
      });

      setTransferDialogOpen(false);
      setTransferWalletAddress("");
      setSelectedCredit(null);

      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error?.message || error?.response?.data?.error || "Failed to transfer credit",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleRetire = async () => {
    if (!selectedCredit || !retirementReason) {
      toast({
        title: "Error",
        description: "Please provide a retirement reason",
        variant: "destructive",
      });
      return;
    }
    if (!selectedCredit.tokenId) {
      toast({
        title: "Error",
        description: "This credit does not have an associated token ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRetiring(true);
      // 1) Execute on-chain retirement with MetaMask
      const { txHash } = await retireCreditOnChain(selectedCredit.tokenId, retirementReason);

      // 2) Record retirement in backend
      await creditsApi.retireCredit(selectedCredit._id, {
        retirementReason,
        blockchainTxHash: txHash,
      });

      toast({
        title: "Retirement Successful",
        description: `Transaction: ${txHash.substring(0, 10)}...`,
      });

      setRetireDialogOpen(false);
      setRetirementReason("");
      setSelectedCredit(null);

      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (error: any) {
      toast({
        title: "Retirement Failed",
        description: error?.message || error?.response?.data?.error || "Failed to retire credit",
        variant: "destructive",
      });
    } finally {
      setIsRetiring(false);
    }
  };

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

        {/* Wallet Connection Alert */}
        {!user?.walletAddress && (
          <Alert className="border-warning/50 bg-warning/10">
            <Wallet className="h-4 w-4" />
            <AlertTitle>Wallet Not Connected</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Connect your MetaMask wallet to transfer and retire carbon credits.</span>
              {isInstalled ? (
                <Button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  size="sm"
                  className="ml-4"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              ) : (
                <Button
                  onClick={() => window.open("https://metamask.io/download/", "_blank")}
                  size="sm"
                  variant="outline"
                  className="ml-4"
                >
                  Install MetaMask
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Wallet Info Card */}
        {user?.walletAddress && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success/10 p-2">
                    <Wallet className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Linked Wallet</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(38)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyWallet}
                >
                  {copiedWallet ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              {isConnected && account && account.toLowerCase() !== user.walletAddress.toLowerCase() && (
                <Alert className="mt-3 border-warning/50 bg-warning/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    MetaMask is connected to a different address. Please switch to your linked wallet or update your linked address.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

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
                              <StatusBadge status={credit.status === "transferred" ? "active" : credit.status}>
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
                              <Dialog open={transferDialogOpen && selectedCredit?._id === credit._id} onOpenChange={(open) => {
                                setTransferDialogOpen(open);
                                if (open) {
                                  setSelectedCredit(credit);
                                } else {
                                  setTransferWalletAddress("");
                                  setSelectedCredit(null);
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <ArrowUpRight className="mr-1 h-3 w-3" />
                                    Transfer
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Transfer Carbon Credits</DialogTitle>
                                    <DialogDescription>
                                      Transfer this credit to another company's wallet address. The recipient must have their wallet linked to their account.
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
                                        <Label htmlFor="walletAddress">Recipient Wallet Address</Label>
                                        <Input
                                          id="walletAddress"
                                          placeholder="0x..."
                                          value={transferWalletAddress}
                                          onChange={(e) => setTransferWalletAddress(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                          Enter the wallet address of the recipient company
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => {
                                      setTransferDialogOpen(false);
                                      setTransferWalletAddress("");
                                    }}>
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={handleTransfer}
                                      disabled={isTransferring || !transferWalletAddress}
                                    >
                                      {isTransferring ? "Transferring..." : "Confirm Transfer"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Dialog open={retireDialogOpen && selectedCredit?._id === credit._id} onOpenChange={(open) => {
                                setRetireDialogOpen(open);
                                if (open) {
                                  setSelectedCredit(credit);
                                } else {
                                  setRetirementReason("");
                                  setSelectedCredit(null);
                                }
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
                                        <Label htmlFor="retirementReason">Retirement Reason</Label>
                                        <Input
                                          id="retirementReason"
                                          placeholder="e.g., Offsetting 2024 Q1 emissions"
                                          value={retirementReason}
                                          onChange={(e) => setRetirementReason(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => {
                                      setRetireDialogOpen(false);
                                      setRetirementReason("");
                                    }}>
                                      Cancel
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={handleRetire}
                                      disabled={isRetiring || !retirementReason}
                                    >
                                      {isRetiring ? "Retiring..." : "Confirm Retirement"}
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
