import { NextResponse } from "next/server";

/**
 * Universal Links pentru aplicația iOS: linkurile https://homesplit.ro/app… se deschid în aplicație.
 * Necesită APPLE_TEAM_ID (din contul Apple Developer). Bundle ID: ro.homesplit.app (mobile/app.json).
 */
export function GET() {
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  if (!teamId) return new NextResponse("Not configured", { status: 404 });
  const appId = `${teamId}.ro.homesplit.app`;
  return NextResponse.json({
    applinks: {
      details: [{ appIDs: [appId], components: [{ "/": "/app*" }, { "/": "/chat*" }, { "/": "/join*" }] }],
    },
  });
}
