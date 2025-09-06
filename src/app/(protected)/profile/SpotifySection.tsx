"use client";
import { useEffect, useState } from 'react';

interface Props<T = any> {
  title: string;
  endpoint: string;
  render: (data: T) => JSX.Element;
}

export default function SpotifySection<T>({ title, endpoint, render }: Props<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(endpoint);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load');
        if (!cancelled) setData(json);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [endpoint]);

  return (
    <div className="p-4 bg-[#1f1b2b] rounded-lg border border-gray-800">
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      {loading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && data && render(data)}
    </div>
  );
}



