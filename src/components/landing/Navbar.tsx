import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-primary/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-accent p-2">
            <Leaf className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="font-display text-lg font-semibold text-white">
            CarbonLedger
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
            Home
          </Link>
          <a href="#lifecycle" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
            How It Works
          </a>
          <a href="#features" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
            Features
          </a>
          <Button asChild variant="hero" size="sm">
            <Link to="/login">Get Started</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-white/10 bg-primary/95 backdrop-blur-md md:hidden"
        >
          <div className="container flex flex-col gap-4 px-4 py-4">
            <Link to="/" className="text-sm font-medium text-white/80">
              Home
            </Link>
            <a href="#lifecycle" className="text-sm font-medium text-white/80">
              How It Works
            </a>
            <a href="#features" className="text-sm font-medium text-white/80">
              Features
            </a>
            <Button asChild variant="hero" className="w-full">
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
