/**
 * Tokenii design system-ului HomeSplit (vezi ../DESIGN.md), traduși pentru React Native.
 * Orice culoare / rază / umbră nouă se adaugă întâi în DESIGN.md și apoi aici.
 */
import { Platform, type ViewStyle } from "react-native";

export const colors = {
  background: "#f6efe6",
  backgroundDense: "#f6f0e8",
  surface: "rgba(255,255,255,0.86)",
  surfaceSolid: "#ffffff",
  text: "#1c1917",
  textSecondary: "#78716c",
  textMuted: "#a8a29e",
  accent: "#bf6a4b",
  accentLight: "#d48a63",
  accentText: "#b85c3e",
  accentSoft: "#fff4e9",
  accentSoftAlt: "#f8e4da",
  calm: "#1f5a4e",
  calmSoft: "#edf6f3",
  border: "#eadccd",
  inputBorder: "rgba(221,201,180,0.9)",
  danger: "#dc2626",
  dangerSoft: "#fef2f2",
  success: "#047857",
  white: "#ffffff",
  /** Culori pe părinte, ca în calendarul web (PARENT_COLORS). */
  parent: {
    tata: "#3B82F6",
    mama: "#EC4899",
    together: "#10B981",
    other: "#8B5CF6",
  } as Record<string, string>,
};

export const radius = {
  card: 32,
  inner: 20,
  chip: 22,
  input: 18,
  pill: 999,
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

export const font = {
  eyebrow: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 1.6, textTransform: "uppercase" as const, color: colors.textMuted },
  title: { fontSize: 22, fontWeight: "600" as const, letterSpacing: -0.3, color: colors.text },
  heading: { fontSize: 18, fontWeight: "600" as const, color: colors.text },
  body: { fontSize: 15, lineHeight: 21, color: colors.text },
  small: { fontSize: 13, color: colors.textSecondary },
  meta: { fontSize: 12, color: colors.textMuted },
};

/** Umbra moale a suprafețelor (`.app-native-surface`). */
export const shadow: ViewStyle = Platform.select<ViewStyle>({
  ios: { shadowColor: "#1c1917", shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
  default: { elevation: 3 },
})!;

/** Umbra caldă a butonului principal. */
export const accentShadow: ViewStyle = Platform.select<ViewStyle>({
  ios: { shadowColor: "#bf6a4b", shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  default: { elevation: 4 },
})!;
