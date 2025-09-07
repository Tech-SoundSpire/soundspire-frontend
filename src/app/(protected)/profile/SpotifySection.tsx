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
        setError(null);
        
        const res = await fetch(endpoint);
        const json = await res.json();
        
        if (!res.ok) {
          throw new Error(json.error || 'Failed to load');
        }
        
        if (!cancelled) {
          setData(json);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        console.error(`Error loading ${title}:`, e);
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [endpoint, title]);

  return (
    <div className="p-4 bg-[#1f1b2b] rounded-lg border border-gray-800">
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="ml-2 text-gray-400">Loading...</span>
        </div>
      )}
      {error && (
        <div className="text-red-500 p-4 bg-red-900/20 rounded-lg border border-red-800">
          <p className="font-medium">❌ Error loading {title}</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs mt-2 text-red-400">
            Check the browser console for detailed error information.
          </p>
        </div>
      )}
      {!loading && !error && data && render(data)}
      {!loading && !error && !data && (
        <div className="text-gray-400 text-center py-8">
          No data available
        </div>
      )}
    </div>
  );
}



