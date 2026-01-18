import { motion } from "framer-motion";
import { FileText, CheckCircle, Coins, ArrowLeftRight, Lock } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Submit Report",
    description: "Companies submit emission reduction reports with supporting documentation",
  },
  {
    icon: CheckCircle,
    title: "Verify",
    description: "Regulators review and verify emission data against baselines",
  },
  {
    icon: Coins,
    title: "Issue Credit",
    description: "Verified reductions generate carbon credits on the blockchain",
  },
  {
    icon: ArrowLeftRight,
    title: "Trade",
    description: "Credits can be transferred between organizations transparently",
  },
  {
    icon: Lock,
    title: "Retire",
    description: "Credits are permanently retired to offset emissions",
  },
];

export function Lifecycle() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Carbon Credit Lifecycle
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From emission reduction to permanent retirement, every step is verified and recorded on an immutable ledger.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-16 hidden h-0.5 w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-5">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex flex-col items-center text-center"
              >
                <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:shadow-glow">
                  <step.icon className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground" />
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {index + 1}
                  </div>
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
