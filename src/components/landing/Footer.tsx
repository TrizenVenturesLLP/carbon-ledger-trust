import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              CarbonLedger
            </span>
          </div>


          <p className="text-sm text-muted-foreground">
            © 2026 CarbonLedger. Committed to sustainability.
          </p>
        </div>
      </div>
    </footer>
  );
}
