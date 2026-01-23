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
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get("role") as Role) || "company";
  
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check demo credentials
    const role = roles.find(r => r.id === selectedRole);
    if (role && email === role.demoEmail && password === role.demoPassword) {
      toast({
        title: "Login Successful",
        description: `Welcome to the ${role.title} Dashboard`,
      });
      navigate(`/dashboard/${selectedRole}`);
    } else if (email && password) {
      // Allow any credentials for demo purposes
      toast({
        title: "Login Successful",
        description: `Welcome to the ${selectedRole} Dashboard`,
      });
      navigate(`/dashboard/${selectedRole}`);
    } else {
      toast({
        title: "Invalid Credentials",
        description: "Please enter valid email and password",
        variant: "destructive",
      });
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

              <Button type="submit" variant="hero" className="w-full" size="lg">
                Sign In
              </Button>
            </form>

            {/* Wallet Connection */}
            <div className="mt-6 border-t border-white/10 pt-6">
              <Button
                variant="heroOutline"
                className="w-full gap-2"
                onClick={() => toast({ title: "Wallet Connection", description: "MetaMask integration coming soon" })}
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet (Optional)
              </Button>
              <p className="mt-2 text-center text-xs text-white/50">
                Connect your wallet for blockchain transactions
              </p>
            </div>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
}
