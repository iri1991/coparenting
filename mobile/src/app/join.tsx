import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Surface } from "@/components/ui";
import { api } from "@/lib/api";
import { parseInviteToken, pendingInvite } from "@/lib/invite";
import { useSession } from "@/lib/session";
import { colors, font, spacing } from "@/theme";

/** Deschis din linkul de invitație (https://homesplit.ro/join?token=…). */
export default function JoinScreen() {
  const { token: rawToken } = useLocalSearchParams<{ token?: string }>();
  const { state, refresh } = useSession();
  const token = rawToken ? parseInviteToken(rawToken) : null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Neconectat: păstrăm invitația și o reluăm după login / creare cont.
  useEffect(() => {
    if (token && state.status === "signedOut") pendingInvite.set(token).catch(() => {});
  }, [token, state.status]);

  if (!token) return <Redirect href="/" />;
  if (state.status === "signedOut") return <Redirect href="/login" />;
  if (state.status === "loading") return null;

  const alreadyInFamily = !!state.data.family;

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      await api("/api/invitations/accept", { method: "POST", body: { token } });
      await api("/api/user/me", { method: "PATCH", body: { parentType: "mama" } }).catch(() => {});
      await pendingInvite.clear();
      await refresh();
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invitația nu a putut fi acceptată.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", padding: spacing.xl }}>
      <Surface style={{ gap: spacing.md }}>
        <Text style={font.title}>Invitație în familie</Text>
        <Text style={font.small}>
          {alreadyInFamily
            ? "Faci deja parte dintr-o familie în HomeSplit. O invitație nouă nu poate fi acceptată din acest cont."
            : `Vei fi adăugat în familia celuilalt părinte și veți vedea același calendar. Conectat ca ${state.data.user.email}.`}
        </Text>
        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        {!alreadyInFamily ? <Button title="Accept invitația" onPress={accept} loading={busy} /> : null}
        <View>
          <Button
            title="Înapoi"
            variant="secondary"
            onPress={() => {
              pendingInvite.clear().catch(() => {});
              router.replace("/");
            }}
          />
        </View>
      </Surface>
    </SafeAreaView>
  );
}
