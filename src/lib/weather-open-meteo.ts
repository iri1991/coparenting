import { wmoWeatherLabelRo } from "@/lib/wmo-weather-ro";

export interface CurrentWeatherSummary {
  temperatureC: number;
  weatherCode: number;
  labelRo: string;
  isDay: boolean;
}

/** Vreme curentă (Open-Meteo, fără cheie API). */
export async function fetchCurrentWeatherOpenMeteo(
  lat: number,
  lon: number
): Promise<CurrentWeatherSummary | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,weather_code,is_day",
    timezone: "Europe/Bucharest",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number; is_day?: number };
  };
  const c = data.current;
  if (
    c?.temperature_2m === undefined ||
    c?.weather_code === undefined ||
    c?.is_day === undefined
  ) {
    return null;
  }
  const code = Math.round(c.weather_code);
  return {
    temperatureC: Math.round(c.temperature_2m * 10) / 10,
    weatherCode: code,
    labelRo: wmoWeatherLabelRo(code),
    isDay: c.is_day === 1,
  };
}
