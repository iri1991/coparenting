import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button, Surface } from "@/components/ui";
import { api } from "@/lib/api";
import { parseYmd } from "@/lib/dates";
import { parentName } from "@/lib/labels";
import type { Bootstrap, WeekProposal } from "@/lib/types";
import { colors, font, spacing } from "@/theme";

const WEEKDAYS = ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"];

/**
 * Propunerea de program pentru săptămâna viitoare (planurile Pro / Family+).
 * Pe planul Free nu apare deloc (fără îndemn la upgrade în aplicație).
 */
export function ProposalCard({ family, onApplied }: { family: NonNullable<Bootstrap["family"]>; onApplied: () => void }) {
  const [proposal, setProposal] = useState<WeekProposal | null>(null);
  const [busy, setBusy] = useState<"approve" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ proposal: WeekProposal | null }>("/api/proposals/current");
      setProposal(data.proposal);
    } catch {
      setProposal(null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!proposal) return null;

  const residenceFor = (slot: string) =>
    slot === "tunari" ? family.residences[0]?.name : slot === "otopeni" ? family.residences[1]?.name : undefined;

  async function act(kind: "approve" | "decline") {
    setBusy(kind);
    setError(null);
    try {
      await api(`/api/proposals/${kind}`, { method: "POST" });
      await load();
      onApplied();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Acțiunea nu a reușit.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Surface style={{ gap: spacing.md }}>
      <View>
        <Text style={font.eyebrow}>Propunere pentru săptămâna viitoare</Text>
        <Text style={[font.heading, { marginTop: 2 }]}>{proposal.weekLabel}</Text>
        <Text style={[font.small, { marginTop: 4 }]}>
          {proposal.myApproved
            ? "Ai aprobat. Se aplică în calendar când aprobă și celălalt părinte."
            : proposal.otherApproved
              ? "Celălalt părinte a aprobat deja. Aprobi și tu?"
              : "Verifică programul propus și aprobă-l ca să intre în calendar."}
        </Text>
      </View>
      <View style={{ gap: 6 }}>
        {proposal.days.map((d) => {
          const date = parseYmd(d.date);
          return (
            <View key={d.date} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Text style={[font.meta, { width: 44 }]}>
                {WEEKDAYS[date.getDay()]} {date.getDate()}
              </Text>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.parent[d.parent] }} />
              <Text style={[font.small, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                {parentName(d.parent, family)}
                {residenceFor(d.location) ? ` · ${residenceFor(d.location)}` : ""}
              </Text>
            </View>
          );
        })}
      </View>
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      {!proposal.myApproved ? (
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Button title="Aprob" onPress={() => act("approve")} loading={busy === "approve"} disabled={busy !== null} style={{ flex: 1 }} />
          <Button title="Refuz" variant="secondary" onPress={() => act("decline")} loading={busy === "decline"} disabled={busy !== null} style={{ flex: 1 }} />
        </View>
      ) : null}
    </Surface>
  );
}
