"use client";

import { useEffect, useState } from "react";
import { Heart, ListMusic, Plus, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface ListItem {
  list_id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_ranked: boolean;
  like_count: number;
  created_at: string;
}

export default function ListsPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const fetchLists = async () => {
    try {
      const res = await fetch("/api/catalog/lists/mine");
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchLists();
    else setLoading(false);
  }, [user]);

  const handleCreateList = async () => {
    if (!newTitle.trim()) return;
    const res = await fetch("/api/catalog/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), description: newDescription.trim() || null }),
    });
    if (res.ok) {
      toast.success(`List "${newTitle.trim()}" created!`);
      setNewTitle("");
      setNewDescription("");
      setShowCreateModal(false);
      fetchLists();
    } else {
      toast.error("Failed to create list");
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Your Lists</h1>
          <p className="text-white/50">Create and manage your curated music lists.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4E27] hover:bg-[#e5431f] text-white rounded-full font-medium transition-colors text-sm"
        >
          <ListMusic className="w-4 h-4" />
          Start a List
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4E27]" />
        </div>
      ) : lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lists.map((list) => (
            <Link
              key={list.list_id}
              href={`/reviews/lists/${list.list_id}`}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-[#FF4E27]/30 transition block"
            >
              <h3 className="text-base font-bold text-white mb-1">{list.title}</h3>
              {list.description && (
                <p className="text-sm text-white/40 line-clamp-2 mb-2">{list.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {list.like_count}</span>
                <span>{new Date(list.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
          <ListMusic className="w-10 h-10 mx-auto mb-4 text-white/20" />
          <p className="text-white/40 mb-2">No lists yet.</p>
          <p className="text-white/30 text-sm mb-4">Create your first curated list!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2 bg-[#FF4E27] hover:bg-[#e5431f] rounded-full text-white font-semibold text-sm transition"
          >
            Start a List
          </button>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#1a1625] border border-white/10 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Create a List</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/50 block mb-1">Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., 2026 Favorites"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 outline-none focus:border-[#FF4E27]/50"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm text-white/50 block mb-1">Description (optional)</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What's this list about?"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 outline-none focus:border-[#FF4E27]/50 resize-none h-20"
                />
              </div>
              <button
                onClick={handleCreateList}
                disabled={!newTitle.trim()}
                className="w-full py-2 bg-[#FF4E27] hover:bg-[#e5431f] disabled:opacity-50 rounded-lg text-white font-semibold text-sm transition"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
