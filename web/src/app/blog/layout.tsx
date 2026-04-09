import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | NagLead Blog",
    default: "NagLead Blog — Lead Tracking for Service Businesses",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-nag-dark text-white">
      {children}
    </div>
  );
}
