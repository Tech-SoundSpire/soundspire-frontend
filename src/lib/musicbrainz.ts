const MB_API_BASE = "https://musicbrainz.org/ws/2";
const USER_AGENT = "SoundSpire/1.0 (contact@soundspire.online)";

let lastRequestTime = 0;

async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
  }
  lastRequestTime = Date.now();
}

async function mbFetch(endpoint: string): Promise<any> {
  await throttle();

  const response = await fetch(`${MB_API_BASE}${endpoint}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") || "2";
    await new Promise((resolve) => setTimeout(resolve, parseInt(retryAfter) * 1000));
    return mbFetch(endpoint);
  }

  if (!response.ok) {
    throw new Error(`MusicBrainz API error: ${response.status}`);
  }

  return response.json();
}

export async function lookupRecordingByISRC(isrc: string): Promise<string | null> {
  const data = await mbFetch(`/recording/?query=isrc:${encodeURIComponent(isrc)}&fmt=json&limit=1`);

  if (!data.recordings || data.recordings.length === 0) {
    return null;
  }

  return data.recordings[0].id;
}

export interface Credit {
  name: string;
  role: string;
  type: "recording" | "work";
}

export async function getRecordingCredits(recordingId: string): Promise<Credit[]> {
  const data = await mbFetch(`/recording/${recordingId}?inc=artist-rels+work-rels&fmt=json`);
  const credits: Credit[] = [];

  if (!data.relations) return credits;

  for (const rel of data.relations) {
    if (rel["target-type"] === "artist" && rel.artist) {
      const role = mapRelationType(rel.type, rel.attributes);
      if (role) {
        credits.push({ name: rel.artist.name, role, type: "recording" });
      }
    }

    if (rel["target-type"] === "work" && rel.work) {
      const workCredits = await getWorkCredits(rel.work.id);
      credits.push(...workCredits);
    }
  }

  return credits;
}

async function getWorkCredits(workId: string): Promise<Credit[]> {
  const data = await mbFetch(`/work/${workId}?inc=artist-rels&fmt=json`);
  const credits: Credit[] = [];

  if (!data.relations) return credits;

  for (const rel of data.relations) {
    if (rel["target-type"] === "artist" && rel.artist) {
      const role = mapWorkRelationType(rel.type);
      if (role) {
        credits.push({ name: rel.artist.name, role, type: "work" });
      }
    }
  }

  return credits;
}

function mapRelationType(type: string, attributes?: string[]): string | null {
  const attrStr = (attributes || []).join(", ");

  switch (type) {
    case "producer":
      return "Producer";
    case "engineer":
      if (attrStr.includes("assistant")) return "Assistant Engineer";
      if (attrStr.includes("additional")) return "Additional Engineer";
      return "Engineer";
    case "mix":
      return "Mix Engineer";
    case "mastering":
      return "Mastering Engineer";
    case "recording":
      return "Recording Engineer";
    case "instrument":
      return attrStr ? `${attrStr.charAt(0).toUpperCase() + attrStr.slice(1)}` : "Musician";
    case "vocal":
      return "Vocals";
    case "performer":
      return "Performer";
    case "programming":
      return "Programming";
    default:
      return null;
  }
}

function mapWorkRelationType(type: string): string | null {
  switch (type) {
    case "writer":
      return "Songwriter";
    case "composer":
      return "Composer";
    case "lyricist":
      return "Lyricist";
    case "arranger":
      return "Arranger";
    default:
      return null;
  }
}

export async function getCreditsForISRC(isrc: string): Promise<Credit[] | null> {
  const recordingId = await lookupRecordingByISRC(isrc);
  if (!recordingId) return null;
  return getRecordingCredits(recordingId);
}
