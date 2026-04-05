"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "@phosphor-icons/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
    });
  }, [supabase]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-nag-dark/95 backdrop-blur-md border-b-4 border-nag-orange">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-nag-orange rounded-sm flex items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-transform duration-200">
            <Megaphone weight="bold" className="text-black text-2xl" />
          </div>
          <span className="font-loud text-3xl tracking-wide headline mt-1">
            NagLead<span className="text-nag-orange">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="#how"
            className="hidden md:block text-zinc-400 hover:text-white font-semibold transition-colors"
          >
            How it Works
          </a>
          <a
            href="#pricing"
            className="hidden md:block text-zinc-400 hover:text-white font-semibold transition-colors mr-2"
          >
            Pricing
          </a>
          <Link
            href={loggedIn ? "/app" : "/login"}
            className="bg-nag-yellow text-black font-loud text-xl headline px-6 py-2 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            {loggedIn ? "MY LEADS" : "LOG IN"}
          </Link>
        </div>
      </div>
      {/* Hazard tape */}
      <div className="absolute -bottom-2 w-full h-2 bg-hazard opacity-50" />
    </nav>
  );
}
