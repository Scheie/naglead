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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NagLead",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  description:
    "Dead-simple lead tracker for solo service businesses. Add a lead in 5 seconds, get nagged until you call them back.",
  url: "https://naglead.com",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      name: "Free",
      description: "Up to 5 active leads",
    },
    {
      "@type": "Offer",
      price: "10",
      priceCurrency: "USD",
      name: "Pro Monthly",
      description: "Unlimited leads, email intake, and more",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        billingDuration: "P1M",
      },
    },
    {
      "@type": "Offer",
      price: "89",
      priceCurrency: "USD",
      name: "Pro Annual",
      description: "Everything in Pro, save $31",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        billingDuration: "P1Y",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
