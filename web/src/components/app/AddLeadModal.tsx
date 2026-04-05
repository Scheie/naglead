"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import {
  countryCodes,
  guessCountryFromTimezone,
  getDialCode,
  normalizePhone,
} from "@/lib/country-codes";

interface AddLeadModalProps {
  onAdd: (lead: {
    name: string;
    description: string;
    phone: string;
    email: string;
  }) => void;
  onClose: () => void;
}

export function AddLeadModal({ onAdd, onClose }: AddLeadModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(() => guessCountryFromTimezone());
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    const normalizedPhone = phone.trim()
      ? normalizePhone(phone.trim(), getDialCode(country))
      : "";

    onAdd({
      name: name.trim(),
      description: description.trim(),
      phone: normalizedPhone,
      email,
    });
  }

  const selectedCountry = countryCodes.find((c) => c.code === country);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lead-title"
        className="relative w-full max-w-md bg-nag-zinc border-t-4 sm:border-4 border-nag-orange rounded-t-2xl sm:rounded-2xl p-6 sm:p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            id="add-lead-title"
            className="font-loud text-3xl headline text-white"
          >
            + NEW LEAD
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Name *
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
              placeholder="Sarah M."
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              What do they need? *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
              placeholder="bathroom reno"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Phone
            </label>
            <div className="flex gap-2">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-black border-2 border-zinc-700 rounded px-2 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors w-24 shrink-0"
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dial}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-black border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
                placeholder="412 555 123"
              />
            </div>
            {phone.trim() && (
              <p className="text-xs text-zinc-500 mt-1">
                Saved as: {normalizePhone(phone.trim(), getDialCode(country))}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 rounded px-4 py-3 text-white font-medium focus:border-nag-orange focus:outline-none transition-colors"
              placeholder="sarah@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !description.trim()}
            className="w-full bg-nag-orange text-black font-loud text-2xl headline py-3 rounded-sm shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 mt-2"
          >
            SAVE LEAD
          </button>
        </form>
      </div>
    </div>
  );
}
