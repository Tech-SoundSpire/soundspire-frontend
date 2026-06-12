import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Clean public download link: https://app.soundspire.online/download/android
// Serves the latest Android APK from the private soundspireandroidassets bucket.
// The bucket stays private — we sign a short-lived URL and 307-redirect to it, with
// Content-Disposition set so the browser downloads the file instead of navigating to it.
const REGION = process.env.APK_AWS_REGION || "ap-south-1";
const BUCKET = process.env.APK_BUCKET || "soundspireandroidassets";
const KEY = process.env.APK_KEY || "apkReleases/v1.0/soundspire-v1.0.apk";
const DOWNLOAD_NAME = process.env.APK_DOWNLOAD_NAME || "soundspire.apk";

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.BUCKET_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.BUCKET_AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function GET() {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
      ResponseContentType: "application/vnd.android.package-archive",
      ResponseContentDisposition: `attachment; filename="${DOWNLOAD_NAME}"`,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    return new NextResponse(null, {
      status: 307,
      headers: {
        Location: url,
        // Don't let the redirect itself get cached (the signed URL expires).
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("APK download error:", error);
    return new NextResponse("Unable to fetch the Android app right now.", { status: 500 });
  }
}
