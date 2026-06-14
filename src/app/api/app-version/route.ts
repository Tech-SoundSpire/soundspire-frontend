import { NextResponse } from "next/server";

// Latest Android app version manifest. The app fetches this on launch, compares
// LATEST_VERSION_CODE against its own BuildConfig.VERSION_CODE, and prompts to update.
//
// To ship an update: build a new APK with a higher versionCode, upload it, then bump
// these env vars (no redeploy needed if your host reads env at runtime; otherwise redeploy).
//   APK_LATEST_VERSION_CODE  - integer, must match the new APK's versionCode
//   APK_LATEST_VERSION_NAME  - display string e.g. "1.1"
//   APK_UPDATE_MANDATORY     - "true" to force the update (blocking), else optional
//   APK_UPDATE_MESSAGE       - optional custom message shown in the dialog
const LATEST_VERSION_CODE = parseInt(process.env.APK_LATEST_VERSION_CODE || "1", 10);
const LATEST_VERSION_NAME = process.env.APK_LATEST_VERSION_NAME || "1.0";
const MANDATORY = process.env.APK_UPDATE_MANDATORY === "true";
const MESSAGE =
  process.env.APK_UPDATE_MESSAGE ||
  "A new version of SoundSpire is available with improvements and fixes.";

export async function GET() {
  return NextResponse.json(
    {
      latestVersionCode: LATEST_VERSION_CODE,
      versionName: LATEST_VERSION_NAME,
      downloadUrl: "/download/android",
      mandatory: MANDATORY,
      message: MESSAGE,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
