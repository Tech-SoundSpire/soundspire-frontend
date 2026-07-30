"use client";
import { useState } from "react";
import { FaFlag } from "react-icons/fa";
import toast from "react-hot-toast";

type TargetType = "chat_message" | "fan_art" | "review" | "user";

const REASONS: { value: string; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate", label: "Hate speech" },
  { value: "sexual", label: "Sexual or explicit content" },
  { value: "violence", label: "Violence or threats" },
  { value: "other", label: "Other" },
];

// Reusable report control. Renders a small flag button that opens a reason modal
// and POSTs to /api/reports. Use on chat messages, fan-art, reviews, and profiles.
export default function ReportButton({
  targetType,
  targetId,
  label = "Report",
  className = "",
}: {
  targetType: TargetType;
  targetId: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, details }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(data.alreadyReported ? "Already reported - thank you." : "Reported. Thank you.");
      setOpen(false);
      setDetails("");
    } catch {
      toast.error("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition ${className}`}
      >
        <FaFlag className="text-xs" /> {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#241e33] rounded-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[#FF4E27] mb-4">Report content</h2>
            <label className="block text-sm text-gray-300 mb-1">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#1a1625] text-white rounded-lg p-2 mb-4 border border-gray-700"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <label className="block text-sm text-gray-300 mb-1">Details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 2000))}
              rows={3}
              className="w-full bg-[#1a1625] text-white rounded-lg p-2 mb-4 border border-gray-700 resize-none"
              placeholder="Add any context that helps our moderators."
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-[#FF4E27] text-white font-medium disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
