import { useState } from "react";
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Text } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Surface, TextField } from "@/components/ui";
import { api } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { useSession } from "@/lib/session";
import { colors, font, spacing } from "@/theme";

const MIN_PASSWORD = 8;

export default function RegisterScreen() {
  const { state, signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.status === "signedIn") return <Redirect href="/" />;

  async function submit() {
    setError(null);
    if (password.length < MIN_PASSWORD) return setError(`Parola trebuie să aibă cel puțin ${MIN_PASSWORD} caractere.`);
    if (password !== confirm) return setError("Parolele nu coincid.");
    setLoading(true);
    try {
      await api("/api/auth/signup", { method: "POST", body: { email: email.trim().toLowerCase(), password } });
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Contul nu a putut fi creat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: spacing.xl }} keyboardShouldPersistTaps="handled">
          <Text style={[font.title, { textAlign: "center", marginBottom: spacing.xl }]}>Creează cont</Text>
          <Surface style={{ gap: spacing.md }}>
            <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
            <TextField label={`Parolă (min. ${MIN_PASSWORD} caractere)`} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
            <TextField label="Confirmă parola" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" />
            {error ? <Text style={{ color: colors.danger, fontSize: 14 }}>{error}</Text> : null}
            <Button title="Creează contul" onPress={submit} loading={loading} disabled={!email || !password || !confirm} />
            <Text style={[font.meta, { textAlign: "center" }]}>
              Continuând, ești de acord cu{" "}
              <Text style={{ color: colors.accentText }} onPress={() => Linking.openURL(`${API_URL}/terms`)}>
                termenii
              </Text>{" "}
              și{" "}
              <Text style={{ color: colors.accentText }} onPress={() => Linking.openURL(`${API_URL}/privacy`)}>
                politica de confidențialitate
              </Text>
              .
            </Text>
          </Surface>
          <Pressable onPress={() => router.replace("/login")} style={{ alignSelf: "center", marginTop: spacing.xl, padding: spacing.sm }}>
            <Text style={font.small}>
              Ai deja cont? <Text style={{ color: colors.accentText, fontWeight: "600" }}>Conectează-te</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
