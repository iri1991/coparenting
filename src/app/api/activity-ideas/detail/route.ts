import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { ageYearsFromBirthDate } from "@/lib/child-age";
import { textSearchPlaceRo } from "@/lib/google-places-text-search";
import { generateActivityIdeaDetail } from "@/lib/activity-idea-detail-ai";

function buildMapsSearchUrl(title: string, city: string): string {
  const q = `${title.trim()} ${city.trim()}`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function buildGoogleWebSearchUrl(title: string, city: string): string {
  const q = `${title.trim()} activități copii ${city.trim()}`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Detaliile AI nu sunt configurate pe server (OPENAI_API_KEY)." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Lipsește titlul activității." }, { status: 400 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { familyId: 1 } }
  );
  const familyIdRaw = (user as { familyId?: unknown })?.familyId;
  if (!familyIdRaw) {
    return NextResponse.json({ error: "Nu aveți familie configurată." }, { status: 400 });
  }
  let familyOid: ObjectId;
  try {
    familyOid = new ObjectId(String(familyIdRaw));
  } catch {
    return NextResponse.json({ error: "Familie invalidă." }, { status: 400 });
  }

  const family = await getActiveFamily(db, familyOid);
  if (!family) {
    return NextResponse.json({ error: "Familia nu este activă." }, { status: 403 });
  }

  const fam = family as { activityCity?: string | null };
  const cityLabel =
    typeof body.cityLabel === "string" && body.cityLabel.trim()
      ? body.cityLabel.trim()
      : (fam.activityCity ?? "").trim() || "România";

  const childDocs = await db
    .collection("children")
    .find({ familyId: familyOid })
    .sort({ createdAt: 1 })
    .limit(1)
    .toArray();
  const first = childDocs[0] as { birthDate?: string | null } | undefined;
  const childAgeYears = ageYearsFromBirthDate(first?.birthDate ?? undefined);

  const placeQuery = `${title} ${cityLabel}`;
  let placeHint: Awaited<ReturnType<typeof textSearchPlaceRo>> = null;
  try {
    placeHint = await textSearchPlaceRo(placeQuery);
  } catch {
    placeHint = null;
  }

  try {
    const ai = await generateActivityIdeaDetail({
      title,
      cityLabel,
      childAgeYears,
      placeHint,
    });

    return NextResponse.json({
      ...ai,
      googleMapsSearchUrl: buildMapsSearchUrl(title, cityLabel),
      googleWebSearchUrl: buildGoogleWebSearchUrl(title, cityLabel),
      placeFromGoogle: placeHint
        ? {
            name: placeHint.name,
            formattedAddress: placeHint.formattedAddress,
            rating: placeHint.rating,
            userRatingsTotal: placeHint.userRatingsTotal,
            openNow: placeHint.openNow,
          }
        : null,
      sourcesNote:
        process.env.GOOGLE_PLACES_API_KEY?.trim() && placeHint?.formattedAddress
          ? "Adresă indicativă din Google Places (verifică în Maps)."
          : "Pentru adrese și orar folosește linkurile către Google Maps și căutarea web.",
    });
  } catch (e) {
    console.error("activity-ideas/detail", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Eroare la generarea detaliilor." },
      { status: 500 }
    );
  }
}
