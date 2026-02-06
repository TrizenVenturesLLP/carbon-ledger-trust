import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useMetaMask } from "@/hooks/use-metamask";
import { authApi } from "@/api/auth.api";
import { Wallet } from "lucide-react";

type Role = "company" | "regulator";

const roles = [
  {
    id: "company" as Role,
    title: "Company",
    description: "Submit reports, trade and retire credits",
    icon: Building2,
  },
  {
    id: "regulator" as Role,
    title: "Regulator",
    description: "Verify reports and issue credits",
    icon: Shield,
  },
];

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const { connect, isConnected, account, isInstalled } = useMetaMask();
  const [selectedRole, setSelectedRole] = useState<Role>("company");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    walletAddress: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update wallet address when MetaMask connects
  useEffect(() => {
    if (account) {
      setFormData(prev => ({ ...prev, walletAddress: account }));
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (selectedRole === "company" && !formData.companyName) {
      toast({
        title: "Company Name Required",
        description: "Please enter your company name",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await authApi.register({
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        companyName: selectedRole === "company" ? formData.companyName : undefined,
        walletAddress: formData.walletAddress || undefined,
      });

      // Auto login after registration
      await login(formData.email, formData.password);

      toast({
        title: "Account Created",
        description: "Your account has been created successfully",
      });

      // Navigate based on role
      if (selectedRole === "company") {
        navigate("/dashboard/company/reports");
      } else {
        navigate("/dashboard/regulator/reviews");
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.error || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="rounded-lg bg-accent p-2">
            <Leaf className="h-6 w-6 text-accent-foreground" />
          </div>
          <span className="font-display text-2xl font-semibold text-white">
            CarbonLedger
          </span>
        </Link>

        <Card className="border-white/10 bg-white/10 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl text-white">Create Account</CardTitle>
            <CardDescription className="text-white/70">
              Select your role and sign up to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.id);
                    setFormData({ ...formData, companyName: "" });
                  }}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                    selectedRole === role.id
                      ? "border-accent bg-accent/20 text-white"
                      : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <role.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{role.title}</span>
                  <span className="text-xs text-white/50">{role.description}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-accent"
                  required
                />
              </div>

              {selectedRole === "company" && (
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-white/90">Company Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Enter your company name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-accent"
                    required={selectedRole === "company"}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-accent"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-accent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="walletAddress" className="text-white/90">
                  Wallet Address (Optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="walletAddress"
                    type="text"
                    placeholder="0x..."
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-accent"
                  />
                  {isInstalled && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={connect}
                      className="whitespace-nowrap"
                    >
                      <Wallet className="h-4 w-4 mr-1" />
                      {isConnected ? "Connected" : "Connect"}
                    </Button>
                  )}
                </div>
                {isConnected && account && (
                  <p className="text-xs text-success">
                    Connected: {account.substring(0, 6)}...{account.substring(38)}
                  </p>
                )}
                <p className="text-xs text-white/50">
                  {isInstalled 
                    ? "Connect your MetaMask wallet or enter manually"
                    : "Install MetaMask to connect your wallet automatically"}
                </p>
              </div>

              <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-center text-sm text-white/60">
                Already have an account?{" "}
                <Link to="/login" className="text-accent hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
