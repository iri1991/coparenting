const UA = "HomeSplit/1.0 (coparenting calendar; contact via app support)";

/** Geocodare oraș → coordonate (OpenStreetMap Nominatim). */
export async function geocodeQuery(
  query: string,
  opts?: { countryCode?: string }
): Promise<{ lat: number; lon: number; displayName: string } | null> {
  const q = query.trim();
  if (q.length < 2) return null;
  const params = new URLSearchParams({
    q,
    format: "json",
    limit: "1",
    addressdetails: "1",
  });
  if (opts?.countryCode) params.set("countrycodes", opts.countryCode);
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { lat?: string; lon?: string; display_name?: string }[];
  const first = data[0];
  if (!first?.lat || !first?.lon) return null;
  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon, displayName: first.display_name ?? q };
}

/** Reverse geocoding pentru etichetă lizibilă. */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "json",
  });
  const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { display_name?: string };
  return data.display_name ?? null;
}
