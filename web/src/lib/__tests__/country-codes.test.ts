import { describe, it, expect } from "vitest";
import {
  countryCodes,
  getCurrencySymbol,
  getDialCode,
  formatMoney,
  normalizePhone,
  guessCountryFromTimezone,
} from "../country-codes";

describe("getCurrencySymbol", () => {
  it("returns $ for US", () => {
    expect(getCurrencySymbol("US")).toBe("$");
  });

  it("returns £ for GB", () => {
    expect(getCurrencySymbol("GB")).toBe("£");
  });

  it("returns € for EU countries", () => {
    expect(getCurrencySymbol("DE")).toBe("€");
    expect(getCurrencySymbol("FR")).toBe("€");
    expect(getCurrencySymbol("IE")).toBe("€");
  });

  it("returns kr for Scandinavian countries", () => {
    expect(getCurrencySymbol("NO")).toBe("kr");
    expect(getCurrencySymbol("SE")).toBe("kr");
    expect(getCurrencySymbol("DK")).toBe("kr");
  });

  it("returns $ for unknown country codes", () => {
    expect(getCurrencySymbol("XX")).toBe("$");
    expect(getCurrencySymbol("")).toBe("$");
  });
});

describe("getDialCode", () => {
  it("returns +1 for US", () => {
    expect(getDialCode("US")).toBe("+1");
  });

  it("returns +44 for GB", () => {
    expect(getDialCode("GB")).toBe("+44");
  });

  it("returns +47 for NO", () => {
    expect(getDialCode("NO")).toBe("+47");
  });

  it("returns +1 for unknown country codes", () => {
    expect(getDialCode("XX")).toBe("+1");
  });
});

describe("formatMoney", () => {
  it("formats USD", () => {
    expect(formatMoney(15000, "US")).toBe("$150");
  });

  it("formats GBP", () => {
    expect(formatMoney(15000, "GB")).toBe("£150");
  });

  it("formats EUR", () => {
    expect(formatMoney(8900, "DE")).toBe("€89");
  });

  it("formats zero", () => {
    expect(formatMoney(0, "US")).toBe("$0");
  });

  it("uses $ for unknown countries", () => {
    expect(formatMoney(1000, "XX")).toBe("$10");
  });
});

describe("normalizePhone", () => {
  it("preserves numbers starting with +", () => {
    expect(normalizePhone("+14155551234", "+1")).toBe("+14155551234");
  });

  it("strips leading 0 and adds dial code", () => {
    expect(normalizePhone("0412555123", "+61")).toBe("+61412555123");
  });

  it("adds dial code to bare digits", () => {
    expect(normalizePhone("4155551234", "+1")).toBe("+14155551234");
  });

  it("strips non-numeric characters except +", () => {
    expect(normalizePhone("(415) 555-1234", "+1")).toBe("+14155551234");
  });
});

describe("guessCountryFromTimezone", () => {
  it("returns US for unknown timezones", () => {
    // guessCountryFromTimezone uses Intl which we can't mock easily,
    // but it should always return a string
    const result = guessCountryFromTimezone();
    expect(typeof result).toBe("string");
    expect(result.length).toBe(2);
  });
});

describe("countryCodes", () => {
  it("has unique country codes", () => {
    const codes = countryCodes.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("every entry has required fields", () => {
    for (const c of countryCodes) {
      expect(c.code).toBeTruthy();
      expect(c.dial).toMatch(/^\+\d+$/);
      expect(c.flag).toBeTruthy();
      expect(c.currency).toBeTruthy();
      expect(c.currencySymbol).toBeTruthy();
    }
  });

  it("includes key markets", () => {
    const codes = countryCodes.map((c) => c.code);
    expect(codes).toContain("US");
    expect(codes).toContain("GB");
    expect(codes).toContain("AU");
    expect(codes).toContain("CA");
    expect(codes).toContain("NZ");
  });
});
