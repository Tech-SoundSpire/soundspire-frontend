import { NextResponse } from "next/server";

// Clean public download link: https://app.soundspire.online/download/android
// Sends users to the Google Play listing. (Previously served the APK from the private
// soundspireandroidassets bucket via a signed S3 URL; see git history to restore.)
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.aistudio.soundspire.vsqtyz";

export function GET() {
  // 302 (not permanent) so browsers don't cache it if the target ever changes.
  return NextResponse.redirect(PLAY_STORE_URL, 302);
}
