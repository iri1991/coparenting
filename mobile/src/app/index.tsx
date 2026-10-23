import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useSession } from "@/lib/session";
import { colors } from "@/theme";

export default function Index() {
  const { state } = useSession();
  if (state.status === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return <Redirect href={state.status === "signedIn" ? "/(tabs)" : "/login"} />;
}
