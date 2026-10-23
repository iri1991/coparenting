import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { api } from "@/lib/api";

// Notificările primite cu aplicația deschisă se afișează ca banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let registeredToken: string | null = null;

/** Cere permisiunea și înregistrează dispozitivul la server. Întoarce tokenul sau null. */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "HomeSplit",
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: "#bf6a4b",
    });
  }
  const current = await Notifications.getPermissionsAsync();
  let granted = current.granted;
  if (!granted && current.canAskAgain) {
    granted = (await Notifications.requestPermissionsAsync()).granted;
  }
  if (!granted) return null;
  const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId || undefined;
  const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  await api("/api/mobile/push-token", { method: "POST", body: { token, platform: Platform.OS } });
  registeredToken = token;
  return token;
}

/** La delogare: dispozitivul nu mai primește notificările contului. */
export async function unregisterPushNotifications(): Promise<void> {
  if (!registeredToken) return;
  await api("/api/mobile/push-token", { method: "DELETE", body: { token: registeredToken } }).catch(() => {});
  registeredToken = null;
}

/** Transformă URL-ul din notificare (ruta web) în ecranul aplicației. */
export function routeForNotificationUrl(url: string | undefined): "/(tabs)" | "/(tabs)/chat" | "/(tabs)/account" {
  if (!url) return "/(tabs)";
  if (url.startsWith("/chat")) return "/(tabs)/chat";
  if (url.startsWith("/account")) return "/(tabs)/account";
  return "/(tabs)";
}
