import type { TextStyle, ViewStyle } from "react-native";

export const colors = {
  ink: "#173B3B",
  inkSoft: "#2F514F",
  muted: "#58706D",
  subtle: "#829794",
  background: "#F6F8F4",
  surface: "#FFFFFF",
  surfaceMuted: "#F8FBFA",
  primary: "#137F79",
  primaryDark: "#0F6863",
  primaryDeep: "#124A52",
  primaryRaised: "#1C6268",
  primarySoft: "#E6F5F1",
  primaryBorder: "#B8E2DA",
  onPrimaryMuted: "#D9F3EE",
  mint: "#2563EB",
  mintDark: "#1D4ED8",
  mintSoft: "#EFF6FF",
  mintBorder: "#BFDBFE",
  coral: "#D88924",
  coralSoft: "#FFF7E8",
  coralBorder: "#FED7AA",
  amber: "#B45309",
  amberSoft: "#FFF7E8",
  border: "#DDE9E6",
  borderStrong: "#C4D7D3",
  danger: "#C83D55",
  dangerSoft: "#FFF0F2",
  success: "#187A65",
  successSoft: "#E8F8F3",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const shadows: Record<"card" | "floating" | "button", ViewStyle> = {
  card: {
    shadowColor: "#27324A",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  floating: {
    shadowColor: "#27324A",
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  button: {
    shadowColor: "#0D4F4B",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
};

export const typography: Record<
  "eyebrow" | "title" | "section" | "body" | "caption",
  TextStyle
> = {
  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
    color: colors.primary,
  },
  title: { fontSize: 28, fontWeight: "800", color: colors.ink },
  section: { fontSize: 18, fontWeight: "800", color: colors.ink },
  body: { fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  caption: { fontSize: 13, lineHeight: 19, color: colors.muted },
};
