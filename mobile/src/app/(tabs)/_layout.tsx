import { Redirect, Tabs } from "expo-router";
import { useSession } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { colors } from "@/theme";

export default function TabsLayout() {
  const { state } = useSession();
  if (state.status === "signedOut") return <Redirect href="/login" />;
  if (state.status === "loading") return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: "#57534e",
        tabBarStyle: { backgroundColor: "rgba(255,255,255,0.96)", borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Acasă", tabBarIcon: ({ color }) => <Icon name="house" color={String(color)} /> }} />
      <Tabs.Screen name="chat" options={{ title: "Chat", tabBarIcon: ({ color }) => <Icon name="message" color={String(color)} /> }} />
      <Tabs.Screen name="account" options={{ title: "Cont", tabBarIcon: ({ color }) => <Icon name="user" color={String(color)} /> }} />
    </Tabs>
  );
}
