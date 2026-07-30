"use client";
import { useEffect, useState, useCallback } from "react";
import { getImageUrl } from "@/utils/userProfileImageUtils";
import toast from "react-hot-toast";

interface BlockRow {
  block_id: string;
  blocked_user_id: string;
  blockedUser?: { username?: string; full_name?: string; profile_picture_url?: string | null };
}

// Blocked-users management for Settings: list + unblock.
export default function BlockedUsersList() {
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blocks", { credentials: "include" });
      const data = await res.json();
      setBlocks(data.blocks || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const unblock = async (id: string) => {
    try {
      const res = await fetch(`/api/blocks/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Unblocked");
      setBlocks((prev) => prev.filter((b) => b.blocked_user_id !== id));
    } catch { toast.error("Failed to unblock"); }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-white font-semibold mb-3">Blocked users</h2>
      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : blocks.length === 0 ? (
        <p className="text-white/40 text-sm">You haven&apos;t blocked anyone.</p>
      ) : (
        <div className="space-y-2">
          {blocks.map((b) => (
            <div key={b.block_id} className="flex items-center gap-3 bg-[#241e33] rounded-lg p-2 border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getImageUrl(b.blockedUser?.profile_picture_url || "images/placeholder.jpg")} alt="" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-white text-sm flex-1 truncate">{b.blockedUser?.username || b.blocked_user_id}</span>
              <button onClick={() => unblock(b.blocked_user_id)} className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white">Unblock</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
