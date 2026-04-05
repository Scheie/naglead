export interface CountryCode {
  code: string;
  dial: string;
  flag: string;
  currency: string;
  currencySymbol: string;
}

export const countryCodes: CountryCode[] = [
  { code: "US", dial: "+1", flag: "🇺🇸", currency: "USD", currencySymbol: "$" },
  { code: "CA", dial: "+1", flag: "🇨🇦", currency: "CAD", currencySymbol: "C$" },
  { code: "GB", dial: "+44", flag: "🇬🇧", currency: "GBP", currencySymbol: "£" },
  { code: "AU", dial: "+61", flag: "🇦🇺", currency: "AUD", currencySymbol: "A$" },
  { code: "NZ", dial: "+64", flag: "🇳🇿", currency: "NZD", currencySymbol: "NZ$" },
  { code: "IE", dial: "+353", flag: "🇮🇪", currency: "EUR", currencySymbol: "€" },
  { code: "DE", dial: "+49", flag: "🇩🇪", currency: "EUR", currencySymbol: "€" },
  { code: "FR", dial: "+33", flag: "🇫🇷", currency: "EUR", currencySymbol: "€" },
  { code: "ES", dial: "+34", flag: "🇪🇸", currency: "EUR", currencySymbol: "€" },
  { code: "IT", dial: "+39", flag: "🇮🇹", currency: "EUR", currencySymbol: "€" },
  { code: "NL", dial: "+31", flag: "🇳🇱", currency: "EUR", currencySymbol: "€" },
  { code: "SE", dial: "+46", flag: "🇸🇪", currency: "SEK", currencySymbol: "kr" },
  { code: "NO", dial: "+47", flag: "🇳🇴", currency: "NOK", currencySymbol: "kr" },
  { code: "DK", dial: "+45", flag: "🇩🇰", currency: "DKK", currencySymbol: "kr" },
  { code: "FI", dial: "+358", flag: "🇫🇮", currency: "EUR", currencySymbol: "€" },
  { code: "CH", dial: "+41", flag: "🇨🇭", currency: "CHF", currencySymbol: "CHF" },
  { code: "AT", dial: "+43", flag: "🇦🇹", currency: "EUR", currencySymbol: "€" },
  { code: "BE", dial: "+32", flag: "🇧🇪", currency: "EUR", currencySymbol: "€" },
  { code: "PT", dial: "+351", flag: "🇵🇹", currency: "EUR", currencySymbol: "€" },
  { code: "IN", dial: "+91", flag: "🇮🇳", currency: "INR", currencySymbol: "₹" },
  { code: "PH", dial: "+63", flag: "🇵🇭", currency: "PHP", currencySymbol: "₱" },
  { code: "SG", dial: "+65", flag: "🇸🇬", currency: "SGD", currencySymbol: "S$" },
  { code: "MY", dial: "+60", flag: "🇲🇾", currency: "MYR", currencySymbol: "RM" },
  { code: "ZA", dial: "+27", flag: "🇿🇦", currency: "ZAR", currencySymbol: "R" },
  { code: "MX", dial: "+52", flag: "🇲🇽", currency: "MXN", currencySymbol: "MX$" },
  { code: "BR", dial: "+55", flag: "🇧🇷", currency: "BRL", currencySymbol: "R$" },
  { code: "AE", dial: "+971", flag: "🇦🇪", currency: "AED", currencySymbol: "د.إ" },
  { code: "IL", dial: "+972", flag: "🇮🇱", currency: "ILS", currencySymbol: "₪" },
  { code: "JP", dial: "+81", flag: "🇯🇵", currency: "JPY", currencySymbol: "¥" },
  { code: "KR", dial: "+82", flag: "🇰🇷", currency: "KRW", currencySymbol: "₩" },
];

// Guess default country from timezone
const tzToCountry: Record<string, string> = {
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "Europe/London": "GB",
  "Australia/Sydney": "AU",
  "Australia/Perth": "AU",
  "Australia/Melbourne": "AU",
  "Pacific/Auckland": "NZ",
  "Europe/Dublin": "IE",
  "Europe/Berlin": "DE",
  "Europe/Paris": "FR",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI",
  "Europe/Zurich": "CH",
  "Europe/Vienna": "AT",
  "Europe/Brussels": "BE",
  "Europe/Lisbon": "PT",
  "Asia/Kolkata": "IN",
  "Asia/Manila": "PH",
  "Asia/Singapore": "SG",
  "Asia/Kuala_Lumpur": "MY",
  "Africa/Johannesburg": "ZA",
  "America/Mexico_City": "MX",
  "America/Sao_Paulo": "BR",
  "Asia/Dubai": "AE",
  "Asia/Jerusalem": "IL",
  "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR",
};

export function guessCountryFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tzToCountry[tz] ?? "US";
  } catch {
    return "US";
  }
}

export function getDialCode(countryCode: string): string {
  return countryCodes.find((c) => c.code === countryCode)?.dial ?? "+1";
}

export function getCurrencySymbol(countryCode: string): string {
  return countryCodes.find((c) => c.code === countryCode)?.currencySymbol ?? "$";
}

export function formatMoney(cents: number, countryCode: string): string {
  const symbol = getCurrencySymbol(countryCode);
  const amount = (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${symbol}${amount}`;
}

export function normalizePhone(phone: string, dialCode: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  // Already has a country code
  if (cleaned.startsWith("+")) return cleaned;
  // Starts with 0 (local format in many countries) — strip it and add dial code
  if (cleaned.startsWith("0")) return dialCode + cleaned.slice(1);
  // Just digits — prepend dial code
  return dialCode + cleaned;
}
