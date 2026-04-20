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
  FAQ,
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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is NagLead?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NagLead is a dead-simple lead tracker for solo service businesses. Add a lead in 5 seconds, and it sends escalating reminders until you call them back. It's not a CRM. It's a nag engine.",
      },
    },
    {
      "@type": "Question",
      name: "How much does NagLead cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NagLead is free for up to 5 active leads. Pro is $10/month or $89/year for unlimited leads, auto-add leads from email, and more.",
      },
    },
    {
      "@type": "Question",
      name: "How is NagLead different from a CRM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CRMs like Jobber ($39/month) and HubSpot are built for teams with pipelines, scheduling, and invoicing. NagLead does one thing: it won't let you forget to call someone back. No pipeline, no automations, just escalating reminders.",
      },
    },
    {
      "@type": "Question",
      name: "What types of businesses use NagLead?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Solo service businesses: cleaners, plumbers, electricians, landscapers, painters, handymen, and photographers. Anyone who gets leads on their phone and sometimes forgets to follow up.",
      },
    },
    {
      "@type": "Question",
      name: "How do the nag reminders work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When you add a lead, NagLead sends push notifications that escalate over time: a friendly nudge at 2 hours, a firm reminder at 6 hours, a warning at 24 hours, and an urgent alert at 48 hours. They continue until you mark the lead as replied, won, or lost.",
      },
    },
    {
      "@type": "Question",
      name: "Can NagLead automatically add leads from email?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Pro users get a dedicated email address. Forward lead emails from Yelp, Thumbtack, website forms, or any source. NagLead automatically extracts the customer's name, phone, email, and what they need using AI.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <Hero />
      <LostRevenueTicker />
      <ProblemSection />
      <HowItWorks />
      <EscalationTimeline />
      <Pricing />
      {/* <Testimonials /> */}
      <FAQ />
      <Footer />
    </>
  );
}
