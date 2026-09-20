"use client";
import { useState, useRef, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import ReportButton from "./ReportButton";
import BlockButton from "./BlockButton";

type TargetType = "chat_message" | "fan_art" | "review" | "user";

// Burger menu that groups Report + Block into one dropdown (used in the fan-art header,
// right-hand side). Closes on outside click.
export default function ModerationMenu({
  targetType,
  targetId,
  blockedUserId,
  username,
  onBlocked,
}: {
  targetType: TargetType;
  targetId: string;
  blockedUserId: string;
  username?: string;
  onBlocked?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Options"
        className="text-gray-400 hover:text-white p-1 rounded"
      >
        <FaBars size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 flex flex-col min-w-[150px] rounded-lg border border-white/10 bg-[#1A1625] py-1 shadow-lg">
          {/* No onClick here: closing the menu would unmount these buttons before their
              modal/confirm can open. They close the menu themselves via onDone. */}
          <div className="px-3 py-1.5 hover:bg-white/5">
            <ReportButton targetType={targetType} targetId={targetId} onDone={() => setOpen(false)} />
          </div>
          <div className="px-3 py-1.5 hover:bg-white/5">
            <BlockButton blockedUserId={blockedUserId} username={username} onBlocked={() => { onBlocked?.(); setOpen(false); }} />
          </div>
        </div>
      )}
    </div>
  );
}
