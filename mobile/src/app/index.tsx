import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { pendingInvite } from "@/lib/invite";
import { useSession } from "@/lib/session";
import { colors } from "@/theme";

export default function Index() {
  const { state } = useSession();
  // Invitație deschisă înainte de conectare → o reluăm acum.
  const [invite, setInvite] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (state.status === "signedIn") pendingInvite.get().then(setInvite).catch(() => setInvite(null));
  }, [state.status]);

  if (state.status === "loading" || (state.status === "signedIn" && invite === undefined)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (state.status === "signedOut") return <Redirect href="/login" />;
  if (invite) return <Redirect href={{ pathname: "/join", params: { token: invite } }} />;
  const { family, needsSetup } = state.data;
  return <Redirect href={!family || needsSetup ? "/setup" : "/(tabs)"} />;
}
