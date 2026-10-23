import { NextResponse } from "next/server";

/**
 * App Links pentru aplicația Android (ro.homesplit.app). Necesită amprenta SHA-256 a certificatului
 * de semnare din Play Console: ANDROID_SHA256_CERT_FINGERPRINTS (mai multe, separate prin virgulă).
 */
export function GET() {
  const fingerprints = (process.env.ANDROID_SHA256_CERT_FINGERPRINTS ?? "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  if (fingerprints.length === 0) return new NextResponse("Not configured", { status: 404 });
  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: { namespace: "android_app", package_name: "ro.homesplit.app", sha256_cert_fingerprints: fingerprints },
    },
  ]);
}
