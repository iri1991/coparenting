/**
 * Piesele de bază ale design system-ului (DESIGN.md) pentru React Native:
 * suprafețe, etichete, butoane (principal / secundar / distructiv) și câmpuri.
 */
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { accentShadow, colors, font, radius, shadow, spacing } from "@/theme";

export function Surface({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={font.eyebrow}>{children}</Text>;
}

/** Antet de secțiune: chip cu iconiță + eyebrow + titlu + descriere (ca în contul web). */
export function SectionHeader({ icon, eyebrow, title, description, tone = "accent" }: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "accent" | "danger";
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.iconChip, tone === "danger" && { backgroundColor: colors.dangerSoft }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Text style={[font.heading, { marginTop: 2 }]}>{title}</Text>
        {description ? <Text style={[font.small, { marginTop: 4, lineHeight: 19 }]}>{description}</Text> : null}
      </View>
    </View>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger" | "dangerOutline";

export function Button({ title, onPress, variant = "primary", disabled, loading, style }: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && [styles.primary, accentShadow],
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        variant === "dangerOutline" && styles.dangerOutline,
        isDisabled && { opacity: 0.5 },
        pressed && { transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? colors.white : colors.accent} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            (variant === "primary" || variant === "danger") && { color: colors.white },
            variant === "dangerOutline" && { color: "#b91c1c" },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function TextField({ label, ...props }: TextInputProps & { label?: string }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={[font.eyebrow, { letterSpacing: 1.4 }]}>{label}</Text> : null}
      <TextInput placeholderTextColor={colors.textMuted} {...props} style={[styles.input, props.style]} />
    </View>
  );
}

export const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    padding: spacing.xl,
    ...shadow,
  },
  sectionHeader: { flexDirection: "row", gap: spacing.lg, alignItems: "flex-start" },
  iconChip: {
    width: 48,
    height: 48,
    borderRadius: radius.chip,
    backgroundColor: colors.accentSoftAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    minHeight: 48,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: "rgba(255,255,255,0.86)", borderWidth: 1, borderColor: colors.inputBorder },
  danger: { backgroundColor: colors.danger },
  dangerOutline: { backgroundColor: "rgba(255,255,255,0.86)", borderWidth: 1, borderColor: "#fee2e2" },
  buttonText: { fontSize: 15, fontWeight: "600", color: "#44403c" },
  input: {
    minHeight: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.text,
  },
});

/** Opțiune selectabilă (pastilă), ca alegerile din formularele web. */
export function Chip({ label, selected, onPress, color }: { label: string; selected: boolean; onPress: () => void; color?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        chipStyles.chip,
        selected && chipStyles.chipSelected,
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      {color ? <View style={[chipStyles.dot, { backgroundColor: color }]} /> : null}
      <Text numberOfLines={1} style={[chipStyles.text, selected && { color: colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.inner,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(255,255,255,0.74)",
  },
  chipSelected: { borderColor: "#c87a5c", backgroundColor: colors.accentSoft },
  text: { fontSize: 14, fontWeight: "600", color: "#57534e" },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
