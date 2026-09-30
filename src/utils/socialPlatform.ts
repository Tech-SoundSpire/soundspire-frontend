// Derive a social link's platform from its URL host, so a link is stored under the right
// platform even when the client labelled it wrongly (the apps' "Add Link" rows have no
// platform picker). Unknown hosts keep the client's label.
const HOSTS: [RegExp, string][] = [
  [/(^|\.)spotify\.com$/, "spotify"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(twitter\.com|x\.com)$/, "twitter"],
  [/(^|\.)(facebook\.com|fb\.com)$/, "facebook"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
];

export function normalizeSocialPlatform(platform: unknown, url: unknown): string {
  const fallback = String(platform ?? "").toLowerCase().trim();
  try {
    const raw = String(url ?? "").trim();
    const host = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname.toLowerCase();
    for (const [re, name] of HOSTS) if (re.test(host)) return name;
  } catch {}
  return fallback;
}
