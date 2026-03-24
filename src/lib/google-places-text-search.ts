/**
 * Căutare simplă Google Places (Text Search). Necesită GOOGLE_PLACES_API_KEY în .env (server).
 * Returnează null dacă lipsește cheia sau nu există rezultate.
 */
export interface PlaceTextSearchHint {
  name?: string;
  formattedAddress?: string;
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
}

export async function textSearchPlaceRo(query: string): Promise<PlaceTextSearchHint | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) return null;
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", key);
  url.searchParams.set("language", "ro");
  url.searchParams.set("region", "ro");
  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    status?: string;
    results?: Array<{
      name?: string;
      formatted_address?: string;
      rating?: number;
      user_ratings_total?: number;
      opening_hours?: { open_now?: boolean };
    }>;
  };
  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") return null;
  const first = json.results?.[0];
  if (!first) return null;
  return {
    name: first.name,
    formattedAddress: first.formatted_address,
    rating: first.rating,
    userRatingsTotal: first.user_ratings_total,
    openNow: first.opening_hours?.open_now,
  };
}
