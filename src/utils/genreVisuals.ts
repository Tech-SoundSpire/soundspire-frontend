// Genre icon + frosted-tint helpers. There is no dedicated free "music-genre icon" API, so we
// use a curated emoji map with a deterministic fallback (hash → pool) so unmapped genres still
// get distinct icons/tints instead of all sharing one.

// Keys are lowercase for case-insensitive lookup.
const EMOJI: Record<string, string> = {
    "pop": "🎵", "k-pop": "🧑‍🎤", "asian pop": "🏮", "asian": "🏮", "latino": "💃", "latin": "💃",
    "rock": "🎸", "alternative": "🎸", "indie": "🎹", "punk": "⚡", "metal": "🤘", "grunge": "🎸",
    "hip hop rap": "🎤", "hip hop": "🎤", "rap": "🎤", "trap": "🎤",
    "r b soul": "🎙️", "r&b": "🎙️", "soul": "🎙️", "funk": "🕺", "disco": "🪩", "gospel": "🙌",
    "jazz": "🎺", "blues": "🎷", "classical": "🎻", "opera": "🎭", "orchestra": "🎻",
    "country": "🤠", "folk": "🪕", "bluegrass": "🪕",
    "electronic": "🎛️", "edm": "🎛️", "house": "🏠", "techno": "🔊", "trance": "🌀",
    "dubstep": "🔊", "ambient": "🌌", "lofi": "🎧", "lo-fi": "🎧",
    "reggae": "🌴", "reggaeton": "🌴", "afrobeat": "🥁", "afro": "🥁", "world": "🌍",
};

const EMOJI_POOL = ["🎵", "🎸", "🎷", "🎺", "🥁", "🎹", "🎤", "🎧", "🪕", "🎻", "🪗", "🎶", "🔊", "💽", "📀"];
const TINT_POOL = [
    "bg-purple-500/15", "bg-blue-500/15", "bg-pink-500/15", "bg-emerald-500/15", "bg-amber-500/15",
    "bg-cyan-500/15", "bg-rose-500/15", "bg-violet-500/15", "bg-orange-500/15", "bg-teal-500/15",
];

function hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
}

export function genreEmoji(name?: string | null): string {
    if (!name) return "🎶";
    const k = name.trim().toLowerCase();
    return EMOJI[k] || EMOJI_POOL[hash(k) % EMOJI_POOL.length];
}

export function genreTint(name?: string | null): string {
    if (!name) return TINT_POOL[0];
    return TINT_POOL[hash(name.trim().toLowerCase()) % TINT_POOL.length];
}
