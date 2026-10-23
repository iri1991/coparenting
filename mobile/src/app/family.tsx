import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/Icon";
import { Button, SectionHeader, Surface, TextField } from "@/components/ui";
import { api } from "@/lib/api";
import { useBootstrap, useSession } from "@/lib/session";
import { colors, font, spacing } from "@/theme";

export default function FamilyRoute() {
  const { state } = useSession();
  if (state.status === "loading") return null;
  if (state.status === "signedOut") return <Redirect href="/login" />;
  if (!state.data.family) return <Redirect href="/setup" />;
  return <FamilyScreen />;
}

/** Setările familiei: numele părinților, copiii, locuințele și invitația celuilalt părinte. */
function FamilyScreen() {
  const { family } = useBootstrap();
  const { refresh } = useSession();
  const f = family!;
  const [parent1, setParent1] = useState(f.parent1Name);
  const [parent2, setParent2] = useState(f.parent2Name);
  const [childName, setChildName] = useState("");
  const [residenceName, setResidenceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function run(key: string, action: () => Promise<void>, ok?: string) {
    setBusy(key);
    setMessage(null);
    try {
      await action();
      await refresh();
      if (ok) setMessage({ tone: "ok", text: ok });
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "A apărut o eroare." });
    } finally {
      setBusy(null);
    }
  }

  function confirmDelete(title: string, onConfirm: () => void) {
    Alert.alert(title, "Acțiunea nu poate fi anulată.", [
      { text: "Renunță", style: "cancel" },
      { text: "Șterge", style: "destructive", onPress: onConfirm },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ padding: spacing.sm }} accessibilityLabel="Înapoi">
          <Icon name="chevronLeft" color={colors.accentText} />
        </Pressable>
        <Text style={font.heading}>Familie</Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {message ? (
            <Text style={{ color: message.tone === "ok" ? colors.success : colors.danger, paddingHorizontal: spacing.xs }}>{message.text}</Text>
          ) : null}

          <Surface style={{ gap: spacing.md }}>
            <SectionHeader icon={<Icon name="user" color={colors.accent} />} eyebrow="Părinți" title="Cum apar numele în calendar" />
            <TextField label="Părinte 1" value={parent1} onChangeText={setParent1} />
            <TextField label="Părinte 2" value={parent2} onChangeText={setParent2} />
            <Button
              title="Salvează numele"
              variant="secondary"
              loading={busy === "names"}
              onPress={() =>
                run("names", () => api("/api/family", { method: "PATCH", body: { parent1Name: parent1.trim(), parent2Name: parent2.trim() } }).then(() => {}), "Numele au fost salvate.")
              }
            />
          </Surface>

          <Surface style={{ gap: spacing.md }}>
            <SectionHeader icon={<Icon name="house" color={colors.accent} />} eyebrow="Locuințe" title="Unde poate sta copilul" />
            {f.residences.map((r) => (
              <View key={r.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={font.body}>{r.name}</Text>
                <Pressable
                  hitSlop={10}
                  accessibilityLabel={`Șterge ${r.name}`}
                  onPress={() =>
                    confirmDelete(`Ștergi „${r.name}”?`, () =>
                      run("res-" + r.id, () => api(`/api/residences?id=${encodeURIComponent(r.id)}`, { method: "DELETE" }).then(() => {}))
                    )
                  }
                >
                  <Icon name="trash" size={20} color={colors.danger} />
                </Pressable>
              </View>
            ))}
            <TextField value={residenceName} onChangeText={setResidenceName} placeholder="Ex: Acasă la tata" />
            <Button
              title="Adaugă locuința"
              variant="secondary"
              disabled={!residenceName.trim()}
              loading={busy === "residence"}
              onPress={() =>
                run("residence", async () => {
                  await api("/api/residences", { method: "POST", body: { name: residenceName.trim() } });
                  setResidenceName("");
                })
              }
            />
          </Surface>

          <Surface style={{ gap: spacing.md }}>
            <SectionHeader icon={<Icon name="user" color={colors.accent} />} eyebrow="Copii" title="Copiii familiei" />
            {f.children.map((c) => (
              <View key={c.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={font.body}>{c.name}</Text>
                <Pressable
                  hitSlop={10}
                  accessibilityLabel={`Șterge ${c.name}`}
                  onPress={() =>
                    confirmDelete(`Ștergi profilul lui ${c.name}?`, () =>
                      run("child-" + c.id, () => api(`/api/children?id=${encodeURIComponent(c.id)}`, { method: "DELETE" }).then(() => {}))
                    )
                  }
                >
                  <Icon name="trash" size={20} color={colors.danger} />
                </Pressable>
              </View>
            ))}
            <TextField value={childName} onChangeText={setChildName} placeholder="Numele copilului" />
            <Button
              title="Adaugă copilul"
              variant="secondary"
              disabled={!childName.trim()}
              loading={busy === "child"}
              onPress={() =>
                run("child", async () => {
                  await api("/api/children", { method: "POST", body: { name: childName.trim() } });
                  setChildName("");
                })
              }
            />
          </Surface>

          {f.memberCount < 2 ? (
            <Surface style={{ gap: spacing.md }}>
              <SectionHeader
                icon={<Icon name="message" color={colors.accent} />}
                eyebrow="Celălalt părinte"
                title="Invită-l în familie"
                description="Primește un email cu link. După ce acceptă, vedeți același calendar și puteți vorbi în chat."
              />
              <TextField value={inviteEmail} onChangeText={setInviteEmail} placeholder="email@exemplu.ro" autoCapitalize="none" keyboardType="email-address" />
              <Button
                title="Trimite invitația"
                disabled={!inviteEmail.trim()}
                loading={busy === "invite"}
                onPress={() =>
                  run(
                    "invite",
                    async () => {
                      await api("/api/invitations", { method: "POST", body: { email: inviteEmail.trim().toLowerCase() } });
                      setInviteEmail("");
                    },
                    "Invitația a fost trimisă."
                  )
                }
              />
            </Surface>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
