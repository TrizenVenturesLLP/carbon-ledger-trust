import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Lifecycle } from "@/components/landing/Lifecycle";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <div id="lifecycle">
          <Lifecycle />
        </div>
        <div id="features">
          <Features />
        </div>
      </main>
      <Footer />
    </div>
  );
}
