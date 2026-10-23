import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Chip, Surface, TextField } from "@/components/ui";
import { DateTimeField } from "@/components/DateTimeField";
import { api } from "@/lib/api";
import { parseYmd, ymd } from "@/lib/dates";
import { notifyEventsChanged, takeEventToEdit } from "@/lib/event-draft";
import { useBootstrap, useSession } from "@/lib/session";
import type { ParentType, ScheduleEvent } from "@/lib/types";
import { colors, font, spacing } from "@/theme";

function toHm(d: Date | null): string | null {
  return d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : null;
}

function fromHm(hm: string | undefined, base: Date): Date | null {
  if (!hm) return null;
  const [h, m] = hm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

export default function EventScreenRoute() {
  const { state } = useSession();
  if (state.status === "loading") return null;
  if (state.status === "signedOut") return <Redirect href="/login" />;
  return <EventScreen />;
}

function EventScreen() {
  const { family } = useBootstrap();
  const params = useLocalSearchParams<{ date?: string }>();
  // Evenimentul de editat (dacă există) e citit o singură dată, la deschiderea ecranului.
  const [editing] = useState<ScheduleEvent | null>(() => takeEventToEdit());
  const residences = family?.residences ?? [];

  const initialResidenceId =
    editing?.residenceId ??
    (editing?.location === "tunari" ? residences[0]?.id : editing?.location === "otopeni" ? residences[1]?.id : undefined) ??
    (editing ? "" : residences[0]?.id ?? "");

  const [date, setDate] = useState<Date>(() => (editing ? parseYmd(editing.date) : params.date ? parseYmd(params.date) : new Date()));
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [parent, setParent] = useState<ParentType>(editing?.parent ?? (family?.myParentIndex === 1 ? "mama" : "tata"));
  const [caretaker, setCaretaker] = useState(editing?.caretakerLabel ?? "");
  const [residenceId, setResidenceId] = useState<string>(initialResidenceId);
  const [customLocation, setCustomLocation] = useState(editing && !initialResidenceId ? editing.locationLabel ?? "" : "");
  const [start, setStart] = useState<Date | null>(() => fromHm(editing?.startTime, date));
  const [end, setEnd] = useState<Date | null>(() => fromHm(editing?.endTime, date));
  const [title, setTitle] = useState(editing?.title ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [pastReason, setPastReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = ymd(new Date());
  const isPast = !!editing && editing.date < today;
  const parents = useMemo(
    () => [
      { key: "tata" as const, label: family?.parent1Name ?? "Părinte 1" },
      { key: "mama" as const, label: family?.parent2Name ?? "Părinte 2" },
      { key: "together" as const, label: "Cu toții" },
      { key: "other" as const, label: "Alt responsabil" },
    ],
    [family]
  );

  async function save() {
    setError(null);
    if (parent === "other" && !caretaker.trim()) return setError("Scrie cine are grijă de copil.");
    if (!residenceId && !customLocation.trim()) return setError("Alege o locuință sau scrie locația.");
    if (isPast && pastReason.trim().length < 8) return setError("Pentru un eveniment din trecut, scrie motivul (minim 8 caractere).");
    const location = residenceId
      ? { residenceId, location: "other", locationLabel: residences.find((r) => r.id === residenceId)?.name }
      : { residenceId: null, location: "other", locationLabel: customLocation.trim() };
    const common = {
      parent,
      ...location,
      caretakerLabel: parent === "other" ? caretaker.trim() : null,
      title: title.trim() || null,
      notes: notes.trim() || null,
    };
    setSaving(true);
    try {
      if (editing) {
        await api("/api/events", {
          method: "PATCH",
          body: {
            id: editing.id,
            date: ymd(date),
            ...common,
            startTime: toHm(start),
            endTime: toHm(end),
            ...(isPast ? { allowPastEdit: true, pastEditReason: pastReason.trim() } : {}),
          },
        });
      } else {
        // Interval de zile: câte un eveniment pe zi (ca pe web); ora de start în prima zi, de final în ultima.
        const days: string[] = [];
        const last = endDate && endDate >= date ? endDate : date;
        for (const d = new Date(date); d <= last && days.length < 366; d.setDate(d.getDate() + 1)) days.push(ymd(d));
        for (let i = 0; i < days.length; i++) {
          await api("/api/events", {
            method: "POST",
            body: {
              date: days[i],
              ...common,
              startTime: i === 0 ? toHm(start) : null,
              endTime: i === days.length - 1 ? toHm(end) : null,
            },
          });
        }
      }
      notifyEventsChanged();
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evenimentul nu a putut fi salvat.");
    } finally {
      setSaving(false);
    }
  }

  function remove() {
    if (!editing) return;
    Alert.alert("Ștergi evenimentul?", undefined, [
      { text: "Renunță", style: "cancel" },
      {
        text: "Șterge",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/events?id=${encodeURIComponent(editing.id)}`, { method: "DELETE" });
            notifyEventsChanged();
            router.back();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Evenimentul nu a putut fi șters.");
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={{ color: colors.accentText, fontSize: 16 }}>Renunță</Text>
        </Pressable>
        <Text style={font.heading}>{editing ? "Editează" : "Program nou"}</Text>
        <View style={{ width: 60 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Surface style={{ gap: spacing.md }}>
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <DateTimeField label={editing ? "Data" : "De la"} mode="date" value={date} onChange={setDate} />
            </View>
            {!editing ? (
              <DateTimeField
                label="Până la (opțional)"
                mode="date"
                value={endDate}
                placeholder="O singură zi"
                onChange={setEndDate}
                onClear={() => setEndDate(null)}
              />
            ) : null}
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <DateTimeField label="Ora start" mode="time" value={start} placeholder="Toată ziua" onChange={setStart} onClear={() => setStart(null)} />
              <DateTimeField label="Ora final" mode="time" value={end} placeholder="—" onChange={setEnd} onClear={() => setEnd(null)} />
            </View>
          </Surface>

          <Surface style={{ gap: spacing.md }}>
            <Text style={font.eyebrow}>Cu cine e copilul</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {parents.map((p) => (
                <Chip key={p.key} label={p.label} color={colors.parent[p.key]} selected={parent === p.key} onPress={() => setParent(p.key)} />
              ))}
            </View>
            {parent === "other" ? <TextField label="Responsabil" value={caretaker} onChangeText={setCaretaker} placeholder="Ex: bunicii, mătușa Ana" /> : null}
          </Surface>

          <Surface style={{ gap: spacing.md }}>
            <Text style={font.eyebrow}>Locație</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {residences.map((r) => (
                <Chip key={r.id} label={r.name} selected={residenceId === r.id} onPress={() => setResidenceId(r.id)} />
              ))}
              <Chip label="Altă locație" selected={!residenceId} onPress={() => setResidenceId("")} />
            </View>
            {!residenceId ? <TextField value={customLocation} onChangeText={setCustomLocation} placeholder="Ex: vacanță, bunici..." /> : null}
          </Surface>

          <Surface style={{ gap: spacing.md }}>
            <TextField label="Titlu (opțional)" value={title} onChangeText={setTitle} placeholder="Ex: Weekend la bunici" />
            <TextField label="Note (opțional)" value={notes} onChangeText={setNotes} multiline style={{ minHeight: 88, paddingTop: 12, textAlignVertical: "top" }} />
          </Surface>

          {isPast ? (
            <Surface style={{ gap: spacing.sm, backgroundColor: "#fff5eb" }}>
              <Text style={[font.body, { fontWeight: "600", color: "#9f5a40" }]}>Eveniment din trecut</Text>
              <Text style={font.small}>Modificarea e excepțională și celălalt părinte e anunțat. Scrie motivul.</Text>
              <TextField value={pastReason} onChangeText={setPastReason} placeholder="Motivul modificării" />
            </Surface>
          ) : null}

          {error ? <Text style={{ color: colors.danger, paddingHorizontal: spacing.xs }}>{error}</Text> : null}
          <Button title={editing ? "Salvează" : "Adaugă în calendar"} onPress={save} loading={saving} />
          {editing && !isPast ? <Button title="Șterge evenimentul" variant="dangerOutline" onPress={remove} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
