import { useState } from "react";
import { Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Surface, TextField } from "@/components/ui";
import { useSession } from "@/lib/session";
import { API_URL } from "@/lib/config";
import { colors, font, spacing } from "@/theme";

export default function LoginScreen() {
  const { state, signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.status === "signedIn") return <Redirect href="/" />;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu te-am putut conecta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: spacing.xl }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", marginBottom: spacing.xxl }}>
            <Image source={require("../../assets/icon.png")} style={{ width: 72, height: 72, borderRadius: 20 }} />
            <Text style={[font.title, { marginTop: spacing.lg }]}>HomeSplit</Text>
            <Text style={[font.small, { marginTop: 4, textAlign: "center" }]}>Programul copilului, clar pentru amândoi părinții.</Text>
          </View>
          <Surface style={{ gap: spacing.md }}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <TextField
              label="Parolă"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              onSubmitEditing={submit}
            />
            {error ? <Text style={{ color: colors.danger, fontSize: 14 }}>{error}</Text> : null}
            <Button title="Conectare" onPress={submit} loading={loading} disabled={!email || !password} />
            <Pressable onPress={() => Linking.openURL(`${API_URL}/forgot-password`)} style={{ alignSelf: "center", padding: spacing.sm }}>
              <Text style={{ color: colors.accentText, fontWeight: "600" }}>Ai uitat parola?</Text>
            </Pressable>
          </Surface>
          <Pressable onPress={() => router.push("/register")} style={{ alignSelf: "center", marginTop: spacing.xl, padding: spacing.sm }}>
            <Text style={font.small}>
              Nu ai cont? <Text style={{ color: colors.accentText, fontWeight: "600" }}>Creează unul</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
