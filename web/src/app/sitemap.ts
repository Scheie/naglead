import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://naglead.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://naglead.com/signup",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://naglead.com/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://naglead.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://naglead.com/blog/best-lead-tracker-cleaning-business-2026",
      lastModified: new Date("2026-04-12"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://naglead.com/blog/naglead-vs-less-annoying-crm",
      lastModified: new Date("2026-04-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://naglead.com/blog/missed-leads-cost-service-business",
      lastModified: new Date("2026-04-10"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://naglead.com/blog/naglead-vs-jobber",
      lastModified: new Date("2026-04-10"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://naglead.com/blog/cleaning-business-lead-follow-up",
      lastModified: new Date("2026-04-09"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://naglead.com/privacy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://naglead.com/terms",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://naglead.com/refunds",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
