import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { Button, Surface } from "@/components/ui";
import { ProposalCard } from "@/components/ProposalCard";
import { api } from "@/lib/api";
import { router } from "expo-router";
import { onEventsChanged, setEventToEdit } from "@/lib/event-draft";
import { addMonths, dayLabel, monthGrid, monthLabel, parseYmd, WEEKDAYS_SHORT_RO, ymd } from "@/lib/dates";
import { locationName, parentName } from "@/lib/labels";
import { useBootstrap } from "@/lib/session";
import type { ScheduleEvent } from "@/lib/types";
import { accentShadow, colors, font, radius, spacing } from "@/theme";

export default function HomeScreen() {
  const { user, family, needsSetup, familyDeactivated } = useBootstrap();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => ymd(new Date()));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setEvents(await api<ScheduleEvent[]>("/api/events"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut încărca programul.");
    }
  }, []);

  useEffect(() => {
    if (family && !familyDeactivated) load();
  }, [family, familyDeactivated, load]);

  // Reîncarcă după adăugare / editare / ștergere din ecranul de eveniment.
  useEffect(() => onEventsChanged(load), [load]);

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    for (const list of map.values()) list.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
    return map;
  }, [events]);

  const days = useMemo(() => monthGrid(month), [month]);
  const today = ymd(new Date());
  const dayEvents = byDate.get(selected) ?? [];
  const firstName = (user.name ?? "").trim().split(/\s+/)[0];

  if (!family || needsSetup || familyDeactivated) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={{ padding: spacing.xl }}>
          <Surface>
            <Text style={font.heading}>{familyDeactivated ? "Familia a fost dezactivată" : "Configurarea nu e completă"}</Text>
            <Text style={[font.small, { marginTop: spacing.sm, lineHeight: 20 }]}>
              {familyDeactivated
                ? "Contactează suportul HomeSplit pentru detalii."
                : "Adaugă copilul și cel puțin o locuință — calendarul apare imediat după."}
            </Text>
            {!familyDeactivated ? <Button title="Continuă configurarea" onPress={() => router.push("/setup")} style={{ marginTop: spacing.lg }} /> : null}
          </Surface>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Pressable
        accessibilityLabel="Adaugă în calendar"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setEventToEdit(null);
          router.push({ pathname: "/event", params: { date: selected } });
        }}
        style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.94 }] }]}
      >
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 96 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.accent}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xs }}>
          <Text style={font.title}>{firstName ? `Bună, ${firstName}` : "Bună"}</Text>
          <Pressable
            accessibilityLabel="Zile indisponibile"
            onPress={() => router.push("/blocked")}
            style={({ pressed }) => [styles.navButton, pressed && { transform: [{ scale: 0.95 }] }]}
          >
            <Icon name="lock" size={20} color="#57534e" />
          </Pressable>
        </View>

        {/* Calendarul: elementul principal al ecranului, ca pe web. */}
        <Surface style={{ padding: spacing.lg }}>
          <View style={styles.monthHeader}>
            <Pressable accessibilityLabel="Luna anterioară" onPress={() => setMonth((m) => addMonths(m, -1))} style={styles.navButton}>
              <Icon name="chevronLeft" color="#57534e" />
            </Pressable>
            <View style={{ alignItems: "center" }}>
              <Text style={font.eyebrow}>Calendar</Text>
              <Text style={[font.heading, { textTransform: "capitalize" }]}>{monthLabel(month)}</Text>
            </View>
            <Pressable accessibilityLabel="Luna următoare" onPress={() => setMonth((m) => addMonths(m, 1))} style={styles.navButton}>
              <Icon name="chevronRight" color="#57534e" />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS_SHORT_RO.map((d) => (
              <Text key={d} style={styles.weekday}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {days.map((d) => {
              const key = ymd(d);
              const inMonth = d.getMonth() === month.getMonth();
              const isSelected = key === selected;
              const isToday = key === today;
              const list = byDate.get(key) ?? [];
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelected(key);
                    if (!inMonth) setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                  }}
                  style={[styles.cell, isSelected && styles.cellSelected]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      !inMonth && { color: colors.textMuted },
                      isToday && !isSelected && { color: colors.accentText, fontWeight: "700" },
                      isSelected && { color: colors.white, fontWeight: "700" },
                    ]}
                  >
                    {d.getDate()}
                  </Text>
                  <View style={styles.dots}>
                    {list.slice(0, 3).map((e) => (
                      <View key={e.id} style={[styles.dot, { backgroundColor: isSelected ? colors.white : colors.parent[e.parent] }]} />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Surface>

        <View style={{ gap: spacing.sm }}>
          <Text style={[font.heading, { paddingHorizontal: spacing.xs }]}>{dayLabel(parseYmd(selected))}</Text>
          {error ? <Text style={{ color: colors.danger, paddingHorizontal: spacing.xs }}>{error}</Text> : null}
          {dayEvents.length === 0 ? (
            <Surface style={{ padding: spacing.lg }}>
              <Text style={font.small}>Nimic programat în această zi.</Text>
            </Surface>
          ) : (
            dayEvents.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => {
                  setEventToEdit(e);
                  router.push("/event");
                }}
                style={({ pressed }) => (pressed ? { transform: [{ scale: 0.98 }] } : undefined)}
              >
              <Surface style={{ padding: spacing.lg, flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                <View style={[styles.parentBar, { backgroundColor: colors.parent[e.parent] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[font.body, { fontWeight: "600" }]}>
                    {e.title?.trim() || `Cu ${parentName(e.parent, family, e.caretakerLabel)}`}
                  </Text>
                  <Text style={[font.small, { marginTop: 2 }]}>
                    {parentName(e.parent, family, e.caretakerLabel)} · {locationName(e, family)}
                    {e.startTime || e.endTime ? ` · ${[e.startTime, e.endTime].filter(Boolean).join("–")}` : ""}
                  </Text>
                  {e.notes ? <Text style={[font.meta, { marginTop: 4 }]}>{e.notes}</Text> : null}
                </View>
                <Icon name="chevronRight" size={18} color={colors.textMuted} />
              </Surface>
              </Pressable>
            ))
          )}
        </View>
        <ProposalCard family={family} onApplied={load} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  monthHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  navButton: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.9)" },
  weekRow: { flexDirection: "row", marginTop: spacing.md, marginBottom: spacing.xs },
  weekday: { flex: 1, textAlign: "center", ...font.eyebrow, letterSpacing: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: radius.chip },
  cellSelected: { backgroundColor: colors.accent },
  cellText: { fontSize: 15, color: colors.text },
  dots: { flexDirection: "row", gap: 2, height: 6, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  parentBar: { width: 4, alignSelf: "stretch", borderRadius: 2 },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    zIndex: 10,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...accentShadow,
  },
  fabPlus: { color: colors.white, fontSize: 30, lineHeight: 32, fontWeight: "400" },
});
