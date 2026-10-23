import Constants from "expo-constants";

/** URL-ul serverului HomeSplit (app.json → expo.extra.apiUrl). */
export const API_URL: string =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl?.replace(/\/$/, "") ?? "https://homesplit.ro";
