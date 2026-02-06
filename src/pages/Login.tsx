import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Building2, Shield, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useMetaMask } from "@/hooks/use-metamask";

type Role = "company" | "regulator";

const roles = [
  {
    id: "company" as Role,
    title: "Company",
    description: "Submit reports, trade and retire credits",
    icon: Building2,
    demoEmail: "demo@acmecorp.com",
    demoPassword: "demo123",
  },
  {
    id: "regulator" as Role,
    title: "Regulator",
    description: "Verify reports and issue credits",
    icon: Shield,
    demoEmail: "demo@regulator.gov",
    demoPassword: "demo123",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const { connect, isConnected, account, isInstalled } = useMetaMask();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get("role") as Role) || "company";
  
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome to your dashboard",
      });
      
      // Navigate based on role
      const role = selectedRole;
      if (role === "company") {
        navigate("/dashboard/company/reports");
      } else {
        navigate("/dashboard/regulator/reviews");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.error || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    if (selectedRoleData) {
      setEmail(selectedRoleData.demoEmail);
      setPassword(selectedRoleData.demoPassword);
      toast({
        title: "Demo Credentials Filled",
        description: "Click Sign In to continue",
      });
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
            <CardTitle className="font-display text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-white/70">
              Select your role and sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    setEmail("");
                    setPassword("");
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

            {/* Demo Credentials Banner */}
            <div className="mb-4 rounded-lg border border-accent/30 bg-accent/10 p-3">
              <p className="text-xs text-white/80 mb-2">
                <strong>Demo Credentials:</strong>
              </p>
              <p className="text-xs text-white/70 font-mono">
                Email: {selectedRoleData?.demoEmail}
              </p>
              <p className="text-xs text-white/70 font-mono">
                Password: {selectedRoleData?.demoPassword}
              </p>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="mt-2 h-7 text-xs text-accent hover:text-accent hover:bg-accent/20"
                onClick={fillDemoCredentials}
              >
                Use Demo Credentials
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-accent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-accent"
                  required
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Wallet Connection */}
            <div className="mt-6 border-t border-white/10 pt-6">
              {isInstalled ? (
                isConnected ? (
                  <div className="space-y-2">
                    <div className="rounded-lg bg-success/10 border border-success/20 p-3">
                      <p className="text-xs text-success font-medium mb-1">Wallet Connected</p>
                      <p className="text-xs font-mono text-white/70">
                        {account?.substring(0, 6)}...{account?.substring(38)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        toast({ title: "Disconnect", description: "Please disconnect from MetaMask extension" });
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="heroOutline"
                      className="w-full gap-2"
                      onClick={connect}
                    >
                      <Wallet className="h-4 w-4" />
                      Connect MetaMask Wallet
                    </Button>
                    <p className="mt-2 text-center text-xs text-white/50">
                      Connect your wallet for blockchain transactions
                    </p>
                  </>
                )
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="heroOutline"
                    className="w-full gap-2"
                    onClick={() => window.open('https://metamask.io/download/', '_blank')}
                  >
                    <Wallet className="h-4 w-4" />
                    Install MetaMask
                  </Button>
                  <p className="mt-2 text-center text-xs text-white/50">
                    Install MetaMask to connect your wallet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-white/60">
          Don't have an account?{" "}
          <Link to="/signup" className="text-accent hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
