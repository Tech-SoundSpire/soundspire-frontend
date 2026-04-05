const CACHE_KEY = "ss_translation_cache";
const MAX_ENTRIES = 500;

type Cache = Record<string, string>;

function getCache(): Cache {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    } catch {
        return {};
    }
}

function saveCache(cache: Cache) {
    const keys = Object.keys(cache);
    if (keys.length > MAX_ENTRIES) {
        // evict oldest half
        const trimmed: Cache = {};
        keys.slice(keys.length - MAX_ENTRIES / 2).forEach(k => trimmed[k] = cache[k]);
        localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
    } else {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
}

function cacheKey(text: string, lang: string) {
    return `${lang}::${text.slice(0, 200)}`;
}

export function getCachedTranslation(text: string, lang: string): string | null {
    return getCache()[cacheKey(text, lang)] ?? null;
}

export function setCachedTranslation(text: string, lang: string, translated: string) {
    const cache = getCache();
    cache[cacheKey(text, lang)] = translated;
    saveCache(cache);
}
