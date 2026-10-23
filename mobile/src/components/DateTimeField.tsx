/**
 * Câmp de dată / oră în stilul design system-ului: pastilă cu valoarea curentă;
 * la atingere deschide selectorul nativ (iOS: foaie de jos, Android: dialogul sistemului).
 */
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import RNDateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Button } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme";

export function DateTimeField({ label, value, mode, onChange, placeholder, onClear }: {
  label: string;
  value: Date | null;
  mode: "date" | "time";
  onChange: (date: Date) => void;
  placeholder?: string;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date());

  const text = value
    ? mode === "date"
      ? value.toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
      : `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : placeholder ?? "—";

  function openPicker() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: value ?? new Date(),
        mode,
        is24Hour: true,
        onValueChange: (_e, date) => onChange(date),
      });
      return;
    }
    setDraft(value ?? new Date());
    setOpen(true);
  }

  return (
    <View style={{ gap: 6, flex: 1 }}>
      <Text style={[font.eyebrow, { letterSpacing: 1.4 }]}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <Pressable
          onPress={openPicker}
          style={{
            flex: 1,
            minHeight: 48,
            justifyContent: "center",
            borderRadius: radius.input,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            backgroundColor: "rgba(255,255,255,0.92)",
            paddingHorizontal: spacing.lg,
          }}
        >
          <Text style={{ fontSize: 16, color: value ? colors.text : colors.textMuted }}>{text}</Text>
        </Pressable>
        {value && onClear ? (
          <Pressable onPress={onClear} hitSlop={8}>
            <Text style={{ color: colors.accentText, fontWeight: "600" }}>Șterge</Text>
          </Pressable>
        ) : null}
      </View>

      {Platform.OS === "ios" ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={{ flex: 1, backgroundColor: "rgba(28,25,23,0.3)" }} onPress={() => setOpen(false)} />
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, padding: spacing.xl, paddingBottom: 36, gap: spacing.md }}>
            <RNDateTimePicker
              value={draft}
              mode={mode}
              display={mode === "date" ? "inline" : "spinner"}
              locale="ro-RO"
              minuteInterval={5}
              accentColor={colors.accent}
              onValueChange={(_e, date) => setDraft(date)}
            />
            <Button
              title="Gata"
              onPress={() => {
                onChange(draft);
                setOpen(false);
              }}
            />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}
