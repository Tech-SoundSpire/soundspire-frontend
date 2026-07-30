"use client";
import { useState } from "react";
import { FaBan } from "react-icons/fa";
import toast from "react-hot-toast";

// Block a user. On success calls onBlocked so the parent can optimistically
// remove their content. Person-level action (profile / chat author menu).
export default function BlockButton({
  blockedUserId,
  username,
  onBlocked,
  className = "",
}: {
  blockedUserId: string;
  username?: string;
  onBlocked?: () => void;
  className?: string;
}) {
  const [submitting, setSubmitting] = useState(false);

  const block = async () => {
    if (!confirm(`Block ${username || "this user"}? You will no longer see their content.`)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ blocked_user_id: blockedUserId }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Blocked ${username || "user"}.`);
      onBlocked?.();
    } catch {
      toast.error("Failed to block user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={block}
      disabled={submitting}
      className={`flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition disabled:opacity-50 ${className}`}
    >
      <FaBan className="text-xs" /> Block
    </button>
  );
}
