import type { Metadata } from "next";
import { Teko, Work_Sans } from "next/font/google";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

export const metadata: Metadata = {
  title: "NagLead | Stop Losing Leads. Start Getting Nagged.",
  description:
    "The follow-up tool for people who hate CRMs. A dead-simple lead tracker for solo service businesses with relentless reminders. $10/month.",
  keywords: [
    "lead tracking",
    "follow up app",
    "contractor leads",
    "plumber lead management",
    "simple CRM alternative",
    "service business",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${teko.variable} ${workSans.variable} scroll-smooth`}
    >
      <body className="min-h-full font-body antialiased overflow-x-hidden selection:bg-nag-orange selection:text-white">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
