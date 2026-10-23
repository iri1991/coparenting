import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/Icon";
import { Button, SectionHeader, Surface, TextField } from "@/components/ui";
import { DateTimeField } from "@/components/DateTimeField";
import { api } from "@/lib/api";
import { MONTHS_RO, parseYmd, ymd } from "@/lib/dates";
import { parentName } from "@/lib/labels";
import { useBootstrap, useSession } from "@/lib/session";
import type { BlockedPeriod } from "@/lib/types";
import { colors, font, spacing } from "@/theme";

function hm(d: Date | null): string | undefined {
  return d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : undefined;
}

function rangeLabel(p: BlockedPeriod): string {
  const s = parseYmd(p.startDate);
  const e = parseYmd(p.endDate);
  const fmt = (d: Date) => `${d.getDate()} ${MONTHS_RO[d.getMonth()]}`;
  const dates = p.startDate === p.endDate ? fmt(s) : `${fmt(s)} – ${fmt(e)}`;
  const times = p.startTime || p.endTime ? ` · ${[p.startTime, p.endTime].filter(Boolean).join("–")}` : "";
  return dates + times;
}

export default function BlockedRoute() {
  const { state } = useSession();
  if (state.status === "loading") return null;
  if (state.status === "signedOut") return <Redirect href="/login" />;
  return <BlockedScreen />;
}

/** Zile în care un părinte nu e disponibil: celălalt nu poate programa copilul la el atunci. */
function BlockedScreen() {
  const { user, family } = useBootstrap();
  const [periods, setPeriods] = useState<BlockedPeriod[]>([]);
  const [adding, setAdding] = useState(false);
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await api<BlockedPeriod[]>("/api/blocked-days");
      const today = ymd(new Date());
      setPeriods(list.filter((p) => p.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut încărca perioadele.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const startDate = ymd(start);
      const endDate = ymd(end < start ? start : end);
      await api("/api/blocked-days", {
        method: "POST",
        body: { startDate, endDate, startTime: hm(startTime), endTime: hm(endTime), note: note.trim() || undefined },
      });
      setAdding(false);
      setNote("");
      setStartTime(null);
      setEndTime(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Perioada nu a putut fi salvată.");
    } finally {
      setBusy(false);
    }
  }

  function remove(p: BlockedPeriod) {
    Alert.alert("Ștergi perioada?", rangeLabel(p), [
      { text: "Renunță", style: "cancel" },
      {
        text: "Șterge",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/blocked-days?id=${encodeURIComponent(p.id)}`, { method: "DELETE" });
            await load();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Perioada nu a putut fi ștearsă.");
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ padding: spacing.sm }} accessibilityLabel="Înapoi">
          <Icon name="chevronLeft" color={colors.accentText} />
        </Pressable>
        <Text style={font.heading}>Zile indisponibile</Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Surface style={{ gap: spacing.md }}>
            <SectionHeader
              icon={<Icon name="lock" color={colors.accent} />}
              eyebrow="Disponibilitate"
              title="Când nu poți avea copilul"
              description="În aceste zile, celălalt părinte nu poate programa copilul la tine. Primești o notificare dacă încearcă."
            />
            {!adding ? (
              <Button title="Adaugă o perioadă" onPress={() => setAdding(true)} />
            ) : (
              <View style={{ gap: spacing.md }}>
                <View style={{ flexDirection: "row", gap: spacing.md }}>
                  <DateTimeField label="De la" mode="date" value={start} onChange={(d) => { setStart(d); if (end < d) setEnd(d); }} />
                </View>
                <DateTimeField label="Până la" mode="date" value={end} onChange={setEnd} />
                <View style={{ flexDirection: "row", gap: spacing.md }}>
                  <DateTimeField label="Ora (prima zi)" mode="time" value={startTime} placeholder="Toată ziua" onChange={setStartTime} onClear={() => setStartTime(null)} />
                  <DateTimeField label="Ora (ultima zi)" mode="time" value={endTime} placeholder="Toată ziua" onChange={setEndTime} onClear={() => setEndTime(null)} />
                </View>
                <TextField label="Notă (opțional)" value={note} onChangeText={setNote} placeholder="Ex: delegație" />
                <Button title="Salvează" onPress={save} loading={busy} />
                <Button title="Renunță" variant="secondary" onPress={() => setAdding(false)} />
              </View>
            )}
          </Surface>

          {error ? <Text style={{ color: colors.danger, paddingHorizontal: spacing.xs }}>{error}</Text> : null}

          {periods.length === 0 ? (
            <Text style={[font.small, { paddingHorizontal: spacing.xs }]}>Nicio perioadă indisponibilă în viitor.</Text>
          ) : (
            periods.map((p) => {
              const mine = p.userId === user.id;
              return (
                <Surface key={p.id} style={{ padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <View style={{ width: 4, alignSelf: "stretch", borderRadius: 2, backgroundColor: colors.parent[p.parentType] ?? colors.textMuted }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[font.body, { fontWeight: "600" }]}>{rangeLabel(p)}</Text>
                    <Text style={font.small}>
                      {mine ? "Tu" : parentName(p.parentType, family)}
                      {p.note ? ` · ${p.note}` : ""}
                    </Text>
                  </View>
                  {mine ? (
                    <Pressable onPress={() => remove(p)} hitSlop={10} accessibilityLabel="Șterge perioada">
                      <Icon name="trash" size={20} color={colors.danger} />
                    </Pressable>
                  ) : null}
                </Surface>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
