import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Coins,
  ExternalLink,
  Copy,
  Check,
  Filter,
  Calendar
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const transactions = [];

type TransactionType = "all" | "issued" | "received" | "sent" | "retired";

export default function TransactionHistory() {
  const [filter, setFilter] = useState<TransactionType>("all");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredTransactions = filter === "all" 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case "issued": return <Coins className="h-4 w-4 text-success" />;
      case "received": return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case "sent": return <ArrowUpRight className="h-4 w-4 text-info" />;
      case "retired": return <Lock className="h-4 w-4 text-muted-foreground" />;
      default: return <Coins className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "issued": return "bg-success/10";
      case "received": return "bg-success/10";
      case "sent": return "bg-info/10";
      case "retired": return "bg-muted";
      default: return "bg-muted";
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case "issued": return "+";
      case "received": return "+";
      case "sent": return "-";
      case "retired": return "";
      default: return "";
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "issued": return "text-success";
      case "received": return "text-success";
      case "sent": return "text-info";
      case "retired": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  return (
    <DashboardLayout role="company">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Transaction History
            </h1>
            <p className="text-muted-foreground">
              Complete blockchain-verified transaction log
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={filter} onValueChange={(value) => setFilter(value as TransactionType)}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">All Transactions</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transactions found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-xl p-3 ${getTypeColor(tx.type)}`}>
                        {getIcon(tx.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase text-muted-foreground">
                            {tx.type}
                          </span>
                          <span className="text-xs text-muted-foreground">{tx.id}</span>
                        </div>
                        <p className="font-medium text-foreground">
                          {tx.type === "issued" && `Credits issued from ${tx.counterparty}`}
                          {tx.type === "received" && `Received from ${tx.counterparty}`}
                          {tx.type === "sent" && `Sent to ${tx.counterparty}`}
                          {tx.type === "retired" && `Credits retired: ${tx.reason}`}
                        </p>
                        {tx.project && (
                          <p className="text-sm text-muted-foreground">Project: {tx.project}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{tx.date} at {tx.time}</span>
                          <span>•</span>
                          <span>Block #{tx.blockNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 lg:items-end">
                      <p className={`text-xl font-bold ${getAmountColor(tx.type)}`}>
                        {getAmountPrefix(tx.type)}{tx.amount} tCO₂e
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="max-w-[150px] truncate font-mono text-xs text-muted-foreground">
                          {tx.hash}
                        </span>
                        <button
                          onClick={() => handleCopyHash(tx.hash)}
                          className="rounded p-1 hover:bg-muted"
                        >
                          {copiedHash === tx.hash ? (
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
              ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
