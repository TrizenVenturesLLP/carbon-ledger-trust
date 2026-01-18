import { motion } from "framer-motion";
import { Shield, Eye, Scale, Database, Users, Globe } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Immutable Records",
    description: "Every transaction is permanently recorded on the blockchain, creating an unalterable audit trail.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "Track the complete lifecycle of every carbon credit from issuance to retirement.",
  },
  {
    icon: Scale,
    title: "Regulatory Compliance",
    description: "Built-in verification workflows ensure all credits meet regulatory standards.",
  },
  {
    icon: Database,
    title: "No Double Counting",
    description: "Unique credit identifiers and blockchain verification prevent duplicate claims.",
  },
  {
    icon: Users,
    title: "Multi-Stakeholder",
    description: "Purpose-built dashboards for companies, regulators, and administrators.",
  },
  {
    icon: Globe,
    title: "Global Standards",
    description: "Compatible with international carbon credit standards and protocols.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
            Why Choose Us
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Built for Trust & Transparency
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform combines blockchain technology with intuitive design to make carbon credit 
            management accessible and trustworthy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary">
                <feature.icon className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
