"use client";

import {
  Megaphone,
  TwitterLogo,
  FacebookLogo,
} from "@phosphor-icons/react";
import Link from "next/link";
import { AppStoreButtons } from "./AppStoreButtons";

export function Footer() {
  return (
    <footer className="bg-nag-dark pt-20 pb-10 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-nag-orange rounded-sm flex items-center justify-center">
                <Megaphone weight="bold" className="text-black text-xl" />
              </div>
              <span className="font-loud text-3xl tracking-wide headline mt-1 text-white">
                NagLead<span className="text-nag-orange">.</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm font-medium text-center md:text-left max-w-xs">
              Built for people who work with their hands, not keyboards. Go win
              some bids.
            </p>
            <div className="mt-4 text-zinc-600 text-xs space-y-1 text-center md:text-left">
              <p>
                <a
                  href="mailto:hello@naglead.com"
                  className="text-zinc-500 hover:text-nag-orange transition-colors"
                >
                  hello@naglead.com
                </a>
              </p>
              <p>NagLead Systems, Norway</p>
            </div>
            <AppStoreButtons className="mt-4" />
          </div>

          {/* Links */}
          <div className="flex gap-12 font-loud text-xl headline text-zinc-400">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <Link href="/login" className="hover:text-white transition-colors">
                LOGIN
              </Link>
              <Link href="#how" className="hover:text-white transition-colors">
                HOW IT WORKS
              </Link>
              <Link
                href="#pricing"
                className="hover:text-white transition-colors"
              >
                PRICING
              </Link>
              <Link href="/blog" className="hover:text-white transition-colors">
                BLOG
              </Link>
            </div>
            <div className="flex flex-col gap-2 text-center md:text-left">
              <a href="mailto:hello@naglead.com" className="hover:text-white transition-colors">
                CONTACT US
              </a>
              <Link href="/privacy" className="hover:text-white transition-colors">
                PRIVACY POLICY
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                TERMS OF SERVICE
              </Link>
              <Link href="/refunds" className="hover:text-white transition-colors">
                REFUNDS
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-sm font-medium">
            &copy; 2026 NagLead Systems. Stop reading the footer and follow up
            on your leads.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:bg-nag-orange hover:text-black transition-all"
            >
              <TwitterLogo weight="fill" className="text-xl" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:bg-nag-orange hover:text-black transition-all"
            >
              <FacebookLogo weight="fill" className="text-xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
