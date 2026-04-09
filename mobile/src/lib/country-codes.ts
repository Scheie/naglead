export interface Country {
  code: string;
  flag: string;
  currency: string;
  currencySymbol: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", flag: "🇺🇸", currency: "USD", currencySymbol: "$" },
  { code: "CA", flag: "🇨🇦", currency: "CAD", currencySymbol: "C$" },
  { code: "GB", flag: "🇬🇧", currency: "GBP", currencySymbol: "£" },
  { code: "AU", flag: "🇦🇺", currency: "AUD", currencySymbol: "A$" },
  { code: "NZ", flag: "🇳🇿", currency: "NZD", currencySymbol: "NZ$" },
  { code: "IE", flag: "🇮🇪", currency: "EUR", currencySymbol: "€" },
  { code: "DE", flag: "🇩🇪", currency: "EUR", currencySymbol: "€" },
  { code: "FR", flag: "🇫🇷", currency: "EUR", currencySymbol: "€" },
  { code: "ES", flag: "🇪🇸", currency: "EUR", currencySymbol: "€" },
  { code: "IT", flag: "🇮🇹", currency: "EUR", currencySymbol: "€" },
  { code: "NL", flag: "🇳🇱", currency: "EUR", currencySymbol: "€" },
  { code: "SE", flag: "🇸🇪", currency: "SEK", currencySymbol: "kr" },
  { code: "NO", flag: "🇳🇴", currency: "NOK", currencySymbol: "kr" },
  { code: "DK", flag: "🇩🇰", currency: "DKK", currencySymbol: "kr" },
  { code: "FI", flag: "🇫🇮", currency: "EUR", currencySymbol: "€" },
  { code: "CH", flag: "🇨🇭", currency: "CHF", currencySymbol: "CHF" },
  { code: "IN", flag: "🇮🇳", currency: "INR", currencySymbol: "₹" },
  { code: "ZA", flag: "🇿🇦", currency: "ZAR", currencySymbol: "R" },
  { code: "MX", flag: "🇲🇽", currency: "MXN", currencySymbol: "MX$" },
  { code: "BR", flag: "🇧🇷", currency: "BRL", currencySymbol: "R$" },
  { code: "JP", flag: "🇯🇵", currency: "JPY", currencySymbol: "¥" },
];

export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Toronto",
  "America/Sao_Paulo",
  "America/Mexico_City",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Oslo",
  "Europe/Stockholm",
  "Europe/Helsinki",
  "Europe/Amsterdam",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Australia/Perth",
  "Pacific/Auckland",
] as const;

export const TZ_TO_COUNTRY: Record<string, string> = {
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US",
  "America/Los_Angeles": "US", "America/Anchorage": "US", "Pacific/Honolulu": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA",
  "Europe/London": "GB", "Europe/Dublin": "IE",
  "Australia/Sydney": "AU", "Australia/Perth": "AU", "Australia/Melbourne": "AU",
  "Pacific/Auckland": "NZ",
  "Europe/Berlin": "DE", "Europe/Paris": "FR", "Europe/Madrid": "ES",
  "Europe/Rome": "IT", "Europe/Amsterdam": "NL", "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO", "Europe/Copenhagen": "DK", "Europe/Helsinki": "FI",
  "Europe/Zurich": "CH", "Europe/Vienna": "AT", "Europe/Brussels": "BE",
  "Europe/Lisbon": "PT",
  "Asia/Kolkata": "IN", "Asia/Manila": "PH", "Asia/Singapore": "SG",
  "Asia/Kuala_Lumpur": "MY", "Asia/Tokyo": "JP", "Asia/Seoul": "KR",
  "Africa/Johannesburg": "ZA", "America/Mexico_City": "MX",
  "America/Sao_Paulo": "BR", "Asia/Dubai": "AE", "Asia/Jerusalem": "IL",
};

export function getCurrencySymbol(countryCode: string): string {
  return COUNTRIES.find((c) => c.code === countryCode)?.currencySymbol ?? "$";
}

export function detectLocale(): { timezone: string; country: string } {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = TZ_TO_COUNTRY[timezone] ?? "US";
    return { timezone, country };
  } catch {
    return { timezone: "America/New_York", country: "US" };
  }
}
