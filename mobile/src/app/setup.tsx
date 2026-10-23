import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Chip, Surface, TextField } from "@/components/ui";
import { DateTimeField } from "@/components/DateTimeField";
import { api } from "@/lib/api";
import { ymd } from "@/lib/dates";
import { parseInviteToken } from "@/lib/invite";
import { useBootstrap, useSession } from "@/lib/session";
import { colors, font, spacing } from "@/theme";

type Step = "start" | "join" | "names" | "child" | "residence" | "invite";
const STEPS: Step[] = ["names", "child", "residence", "invite"];

export default function SetupScreenRoute() {
  const { state } = useSession();
  if (state.status === "loading") return null;
  if (state.status === "signedOut") return <Redirect href="/login" />;
  return <SetupScreen />;
}

function SetupScreen() {
  const data = useBootstrap();
  const { refresh, signOut } = useSession();
  const family = data.family;

  const firstStep: Step = !family
    ? "start"
    : family.children.length === 0
      ? "child"
      : family.residences.length === 0
        ? "residence"
        : "invite";
  const [step, setStep] = useState<Step>(firstStep);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [householdMode, setHouseholdMode] = useState<"two_households" | "together">("two_households");
  const [inviteLink, setInviteLink] = useState("");
  const [myName, setMyName] = useState(data.user.name ?? "");
  const [otherName, setOtherName] = useState("");
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [residenceName, setResidenceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "A apărut o eroare.");
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    await refresh();
    router.replace("/(tabs)");
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.xl, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 4, marginTop: spacing.lg }}>
            <Text style={font.eyebrow}>{stepIndex >= 0 ? `Pasul ${stepIndex + 1} din ${STEPS.length}` : "Bun venit"}</Text>
            <Text style={font.title}>
              {step === "start" && "Hai să pregătim calendarul"}
              {step === "join" && "Am primit o invitație"}
              {step === "names" && "Cum vă numim?"}
              {step === "child" && "Copilul"}
              {step === "residence" && "Unde stă copilul"}
              {step === "invite" && "Invită celălalt părinte"}
            </Text>
          </View>

          {step === "start" ? (
            <>
              <Surface style={{ gap: spacing.md }}>
                <Text style={font.eyebrow}>Cum folosiți HomeSplit?</Text>
                <Chip label="Două locuințe (co-parenting)" selected={householdMode === "two_households"} onPress={() => setHouseholdMode("two_households")} />
                <Chip label="Locuim împreună" selected={householdMode === "together"} onPress={() => setHouseholdMode("together")} />
                <Button
                  title="Creez familia"
                  loading={busy}
                  onPress={() =>
                    run(async () => {
                      await api("/api/family", { method: "POST", body: { householdMode } });
                      await refresh();
                      setStep("names");
                    })
                  }
                />
              </Surface>
              <Button title="Am primit o invitație de la celălalt părinte" variant="secondary" onPress={() => setStep("join")} />
            </>
          ) : null}

          {step === "join" ? (
            <Surface style={{ gap: spacing.md }}>
              <Text style={font.small}>
                Deschide linkul din emailul de invitație pe acest telefon sau lipește-l mai jos. Invitația se acceptă doar din contul cu adresa invitată ({data.user.email}).
              </Text>
              <TextField label="Link invitație" value={inviteLink} onChangeText={setInviteLink} autoCapitalize="none" placeholder="https://homesplit.ro/join?token=…" />
              <Button
                title="Accept invitația"
                loading={busy}
                disabled={!parseInviteToken(inviteLink)}
                onPress={() =>
                  run(async () => {
                    await api("/api/invitations/accept", { method: "POST", body: { token: parseInviteToken(inviteLink) } });
                    await api("/api/user/me", { method: "PATCH", body: { parentType: "mama" } }).catch(() => {});
                    await finish();
                  })
                }
              />
              <Button title="Înapoi" variant="secondary" onPress={() => setStep("start")} />
            </Surface>
          ) : null}

          {step === "names" ? (
            <Surface style={{ gap: spacing.md }}>
              <TextField label="Numele tău" value={myName} onChangeText={setMyName} placeholder="Ex: Andrei" />
              <TextField label="Numele celuilalt părinte" value={otherName} onChangeText={setOtherName} placeholder="Ex: Maria" />
              <Button
                title="Continuă"
                loading={busy}
                disabled={!myName.trim()}
                onPress={() =>
                  run(async () => {
                    await api("/api/family", { method: "PATCH", body: { parent1Name: myName.trim(), parent2Name: otherName.trim() } });
                    await api("/api/user/me", { method: "PATCH", body: { name: myName.trim(), parentType: "tata" } });
                    setStep("child");
                  })
                }
              />
            </Surface>
          ) : null}

          {step === "child" ? (
            <Surface style={{ gap: spacing.md }}>
              <TextField label="Numele copilului" value={childName} onChangeText={setChildName} placeholder="Ex: Dora" />
              <DateTimeField label="Data nașterii (opțional)" mode="date" value={birthDate} placeholder="Alege data" onChange={setBirthDate} onClear={() => setBirthDate(null)} />
              <Button
                title="Continuă"
                loading={busy}
                disabled={!childName.trim()}
                onPress={() =>
                  run(async () => {
                    await api("/api/children", { method: "POST", body: { name: childName.trim(), birthDate: birthDate ? ymd(birthDate) : undefined } });
                    setStep("residence");
                  })
                }
              />
            </Surface>
          ) : null}

          {step === "residence" ? (
            <Surface style={{ gap: spacing.md }}>
              <Text style={font.small}>Adaugă locuința principală. Poți adăuga și altele mai târziu (ex: la celălalt părinte, la bunici).</Text>
              <TextField label="Locuința" value={residenceName} onChangeText={setResidenceName} placeholder="Ex: Acasă la mama" />
              <Button
                title="Continuă"
                loading={busy}
                disabled={!residenceName.trim()}
                onPress={() =>
                  run(async () => {
                    await api("/api/residences", { method: "POST", body: { name: residenceName.trim() } });
                    if ((family?.memberCount ?? 1) >= 2) await finish();
                    else setStep("invite");
                  })
                }
              />
            </Surface>
          ) : null}

          {step === "invite" ? (
            <Surface style={{ gap: spacing.md }}>
              <Text style={font.small}>Celălalt părinte primește un email cu link. După ce acceptă, vedeți același calendar.</Text>
              <TextField label="Emailul celuilalt părinte" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" keyboardType="email-address" />
              <Button
                title="Trimite invitația"
                loading={busy}
                disabled={!inviteEmail.trim()}
                onPress={() =>
                  run(async () => {
                    await api("/api/invitations", { method: "POST", body: { email: inviteEmail.trim().toLowerCase() } });
                    await finish();
                  })
                }
              />
              <Button title="Mai târziu" variant="secondary" onPress={() => run(finish)} />
            </Surface>
          ) : null}

          {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}

          <View style={{ flex: 1 }} />
          {!family ? (
            <Pressable onPress={signOut} style={{ alignSelf: "center", padding: spacing.sm }}>
              <Text style={font.small}>Deconectare</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
