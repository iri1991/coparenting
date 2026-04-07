import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSubscriptionsForUsers, isPushConfigured, sendPushToSubscriptions } from "@/lib/push";
import { homeAppUrl } from "@/lib/deep-links";

/**
 * Trimite o notificare de test utilizatorului curent (după ce activează notificările).
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Push neconfigurat" }, { status: 503 });
  }
  const subs = await getSubscriptionsForUsers([session.user.id]);
  if (subs.length === 0) {
    return NextResponse.json({ error: "Niciun abonament push pentru acest utilizator." }, { status: 404 });
  }
  await sendPushToSubscriptions(subs, {
    title: "HomeSplit",
    body: "Notificări activate. Vei primi alerte pentru evenimente, reminder seara, ritualuri și tratamente medicale.",
    url: homeAppUrl({ tab: "program" }),
  });
  return NextResponse.json({ ok: true, sent: subs.length });
}
