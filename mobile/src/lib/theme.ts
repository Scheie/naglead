// NagLead design tokens — matches web app
export const colors = {
  orange: "#FF4500",
  yellow: "#FFB800",
  black: "#000000",
  white: "#FFFFFF",
  zinc: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b",
  },
  red: {
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    900: "#7f1d1d",
    950: "#450a0a",
  },
  green: {
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    800: "#166534",
    900: "#14532d",
  },
} as const;

export const fonts = {
  loud: "Teko-Bold",
  body: "WorkSans-Regular",
  bodyMedium: "WorkSans-Medium",
  bodySemiBold: "WorkSans-SemiBold",
  bodyBold: "WorkSans-Bold",
} as const;
