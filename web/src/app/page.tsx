import {
  Navbar,
  Hero,
  LostRevenueTicker,
  ProblemSection,
  HowItWorks,
  EscalationTimeline,
  Pricing,
  Testimonials,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <LostRevenueTicker />
      <ProblemSection />
      <HowItWorks />
      <EscalationTimeline />
      <Pricing />
      <Testimonials />
      <Footer />
    </>
  );
}
