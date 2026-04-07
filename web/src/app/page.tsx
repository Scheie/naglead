import {
  Navbar,
  Hero,
  LostRevenueTicker,
  ProblemSection,
  HowItWorks,
  EscalationTimeline,
  Pricing,
  // TODO: Re-enable Testimonials once we have real user quotes
  // Testimonials,
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
      {/* <Testimonials /> */}
      <Footer />
    </>
  );
}
