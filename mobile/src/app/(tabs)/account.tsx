import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Icon } from "@/components/Icon";
import { Button, SectionHeader, Surface, TextField } from "@/components/ui";
import { api } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { useBootstrap, useSession } from "@/lib/session";
import { colors, font, spacing } from "@/theme";

const PLAN_NAMES = { free: "Free", pro: "Pro", family: "Family+" } as const;

export default function AccountScreen() {
  const { user, family } = useBootstrap();
  const { signOut } = useSession();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    setDeleting(true);
    setError(null);
    try {
      await api("/api/user/account", { method: "DELETE", body: { password } });
      await signOut();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Contul nu a putut fi șters.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
        <Text style={[font.title, { paddingHorizontal: spacing.xs }]}>Cont</Text>

        <Surface style={{ gap: spacing.md }}>
          <SectionHeader icon={<Icon name="user" color={colors.accent} />} eyebrow="Profil" title={user.name?.trim() || "Fără nume"} description={user.email ?? undefined} />
          {family ? (
            <View style={{ gap: 4 }}>
              <Text style={font.small}>
                Familie: <Text style={{ color: colors.text, fontWeight: "600" }}>{family.name || `${family.parent1Name} & ${family.parent2Name}`}</Text>
              </Text>
              {/* Fără ofertă de cumpărare în aplicație: abonamentul se gestionează pe site. */}
              <Text style={font.small}>
                Plan: <Text style={{ color: colors.text, fontWeight: "600" }}>{PLAN_NAMES[family.plan]}</Text>
              </Text>
            </View>
          ) : null}
        </Surface>

        {family ? (
          <Surface style={{ gap: spacing.md }}>
            <SectionHeader icon={<Icon name="house" color={colors.accent} />} eyebrow="Familie" title="Setările familiei" description="Numele părinților, copiii, locuințele, invitația." />
            <Button title="Deschide setările familiei" variant="secondary" onPress={() => router.push("/family")} />
            <Button title="Zile indisponibile" variant="secondary" onPress={() => router.push("/blocked")} />
          </Surface>
        ) : null}

        <Surface style={{ gap: spacing.md }}>
          <SectionHeader icon={<Icon name="lock" color={colors.accent} />} eyebrow="Securitate" title="Parolă și confidențialitate" />
          <Button title="Schimbă parola" variant="secondary" onPress={() => Linking.openURL(`${API_URL}/account`)} />
          <Button title="Politica de confidențialitate" variant="secondary" onPress={() => Linking.openURL(`${API_URL}/privacy`)} />
        </Surface>

        <Surface style={{ gap: spacing.md }}>
          <SectionHeader
            tone="danger"
            icon={<Icon name="trash" color={colors.danger} />}
            eyebrow="Zonă sensibilă"
            title="Șterge contul"
            description="Contul și datele tale personale se șterg definitiv. Dacă celălalt părinte rămâne în familie, calendarul și istoricul comun rămân la el. Dacă ești singurul membru, se șterg toate datele familiei și abonamentul se anulează."
          />
          {!deleteOpen ? (
            <Button title="Vreau să-mi șterg contul" variant="dangerOutline" onPress={() => setDeleteOpen(true)} />
          ) : (
            <View style={{ gap: spacing.md }}>
              <TextField label="Confirmă cu parola" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" />
              <Pressable onPress={() => setConfirmed((v) => !v)} style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
                <Switch value={confirmed} onValueChange={setConfirmed} trackColor={{ true: colors.danger, false: "#e7e5e4" }} />
                <Text style={[font.small, { flex: 1, color: colors.text }]}>Înțeleg că ștergerea este definitivă și nu poate fi anulată.</Text>
              </Pressable>
              {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
              <Button
                title="Șterge definitiv"
                variant="danger"
                loading={deleting}
                disabled={!confirmed || !password}
                onPress={() =>
                  Alert.alert("Ștergi contul?", "Această acțiune nu poate fi anulată.", [
                    { text: "Renunță", style: "cancel" },
                    { text: "Șterge", style: "destructive", onPress: deleteAccount },
                  ])
                }
              />
              <Button
                title="Renunță"
                variant="secondary"
                onPress={() => {
                  setDeleteOpen(false);
                  setPassword("");
                  setConfirmed(false);
                  setError(null);
                }}
              />
            </View>
          )}
        </Surface>

        <Button title="Deconectare" variant="dangerOutline" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}
