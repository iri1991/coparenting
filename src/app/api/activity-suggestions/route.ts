import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getTodayDateStringEuropeBucharest } from "@/lib/date-bucharest";
import { geocodeQuery, reverseGeocode } from "@/lib/nominatim";
import { fetchCurrentWeatherOpenMeteo } from "@/lib/weather-open-meteo";
import { ageYearsFromBirthDate } from "@/lib/child-age";
import { generateActivitySuggestions } from "@/lib/activity-suggestions-ai";
import type { ParentType } from "@/types/events";

function parseCoord(n: unknown): number | undefined {
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  return n;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Sugestiile AI nu sunt configurate pe server (OPENAI_API_KEY)." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const latIn = parseCoord(body.lat);
  const lngIn = parseCoord(body.lng);
  const cityFromClient = typeof body.city === "string" ? body.city.trim() : "";

  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { familyId: 1, parentType: 1 } }
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

  const fam = family as {
    parent1Name?: string | null;
    parent2Name?: string | null;
    activityCity?: string | null;
  };
  const parent1Name = (fam.parent1Name ?? "Părinte 1").trim() || "Părinte 1";
  const parent2Name = (fam.parent2Name ?? "Părinte 2").trim() || "Părinte 2";
  const activityCity = (fam.activityCity ?? "").trim();

  const childDocs = await db
    .collection("children")
    .find({ familyId: familyOid })
    .sort({ createdAt: 1 })
    .toArray();

  const children = childDocs.map((c) => {
    const name = (c as { name?: string }).name ?? "Copil";
    const birthDate = (c as { birthDate?: string | null }).birthDate ?? null;
    const allergiesRaw = (c as { allergies?: string | null }).allergies;
    const allergiesNote =
      typeof allergiesRaw === "string" && allergiesRaw.trim() ? allergiesRaw.trim() : undefined;
    return {
      name,
      ageYears: ageYearsFromBirthDate(birthDate ?? undefined),
      allergiesNote,
    };
  });

  const firstChildName = children[0]?.name ?? "copilul";

  let lat = latIn;
  let lng = lngIn;
  let cityLabel = cityFromClient;

  if (lat !== undefined && lng !== undefined) {
    if (!cityLabel) {
      cityLabel = (await reverseGeocode(lat, lng)) ?? `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
    }
  } else {
    const query = cityFromClient || activityCity;
    if (!query) {
      return NextResponse.json(
        {
          error:
            "Lipsește locația. Activează geolocația sau completează orașul în Configurare (secțiunea familie).",
        },
        { status: 400 }
      );
    }
    const geo = await geocodeQuery(`${query}, România`, { countryCode: "ro" });
    if (!geo) {
      return NextResponse.json(
        { error: "Nu am putut găsi coordonate pentru oraș. Încearcă alt nume (ex. București, Cluj-Napoca)." },
        { status: 400 }
      );
    }
    lat = geo.lat;
    lng = geo.lon;
    cityLabel = geo.displayName;
  }

  const weather = await fetchCurrentWeatherOpenMeteo(lat!, lng!);

  const todayStr = getTodayDateStringEuropeBucharest();
  const eventDocs = await db
    .collection("schedule_events")
    .find({ familyId: familyOid, date: todayStr })
    .sort({ startTime: 1 })
    .toArray();

  function parentFromEventDoc(doc: { parent?: string | null; type?: string | null }): ParentType | null {
    const p = doc.parent;
    if (p === "tata" || p === "mama" || p === "together") return p;
    const t = doc.type ?? "other";
    if (t === "tunari") return "tata";
    if (t === "otopeni") return "mama";
    if (t === "together") return "together";
    return "tata";
  }

  let todayParent: ParentType | null = null;
  if (eventDocs.length > 0) {
    todayParent = parentFromEventDoc(eventDocs[0] as { parent?: string | null; type?: string | null });
  }

  const viewerParentType =
    session.user.parentType === "tata" || session.user.parentType === "mama"
      ? session.user.parentType
      : null;

  let viewerIsPrimaryCaretakerToday = false;
  if (todayParent === null) {
    viewerIsPrimaryCaretakerToday = false;
  } else if (todayParent === "together") {
    viewerIsPrimaryCaretakerToday = true;
  } else if (viewerParentType && todayParent === viewerParentType) {
    viewerIsPrimaryCaretakerToday = true;
  }

  const calendarMissingToday = eventDocs.length === 0;

  try {
    const result = await generateActivitySuggestions({
      cityLabel,
      weather,
      children,
      parent1Name,
      parent2Name,
      childGenericName: firstChildName,
      todayParent,
      viewerParentType,
      viewerIsPrimaryCaretakerToday,
      calendarMissingToday,
    });

    return NextResponse.json({
      ...result,
      meta: {
        contextDate: todayStr,
        cityLabel,
        temperatureC: weather?.temperatureC ?? null,
        weatherLabelRo: weather?.labelRo ?? null,
        todayParent,
        viewerIsPrimaryCaretakerToday,
      },
    });
  } catch (e) {
    console.error("activity-suggestions", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Eroare la generarea sugestiilor." },
      { status: 500 }
    );
  }
}
