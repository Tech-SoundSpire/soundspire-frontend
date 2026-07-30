"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

type Tab = "reports" | "users" | "audit";

interface Report {
  report_id: string;
  reporter_user_id: string;
  target_type: "chat_message" | "fan_art" | "review" | "user";
  target_id: string;
  reason: string;
  details: string | null;
  status: "open" | "actioned" | "dismissed";
  created_at: string;
  reporter?: { username?: string; full_name?: string };
}
interface AdminUser {
  user_id: string;
  username: string;
  email: string;
  full_name: string | null;
  is_banned: boolean;
  is_admin: boolean;
}
interface Action {
  action_id: string;
  action: string;
  target_type: string;
  target_id: string;
  note: string | null;
  created_at: string;
  moderator_username: string | null;
}

export default function ModerationDashboard() {
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("reports");

  if (isLoading) return <Shell><p className="text-white/50">Loading…</p></Shell>;
  if (!user?.isAdmin) return <Shell><p className="text-red-400">Access denied. Admins only.</p></Shell>;

  return (
    <Shell>
      <div className="flex gap-2 mb-6">
        {(["reports", "users", "audit"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? "bg-[#FF4E27] text-white" : "bg-white/5 text-white/60 hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "reports" && <ReportsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "audit" && <AuditTab />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1a1625] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-black mb-6">Moderation</h1>
        {children}
      </div>
    </div>
  );
}

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}

function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState("open");
  const [targetType, setTargetType] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (status) qs.set("status", status);
      if (targetType) qs.set("target_type", targetType);
      const res = await fetch(`/api/admin/reports?${qs}`, { credentials: "include" });
      const data = await res.json();
      setReports(data.reports || []);
    } catch { toast.error("Failed to load reports"); }
    finally { setLoading(false); }
  }, [status, targetType]);
  useEffect(() => { load(); }, [load]);

  const hide = async (r: Report) => {
    try { await post("/api/admin/hide-content", { target_type: r.target_type, target_id: r.target_id }); toast.success("Content hidden"); load(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const ban = async (r: Report) => {
    if (!confirm("Ban this user?")) return;
    try { await post("/api/admin/ban-user", { user_id: r.target_id }); toast.success("User banned"); load(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const dismiss = async (r: Report) => {
    try { await post(`/api/admin/reports/${r.report_id}/dismiss`); toast.success("Dismissed"); load(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-[#241e33] rounded-lg p-2 text-sm border border-white/10">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="actioned">Actioned</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select value={targetType} onChange={(e) => setTargetType(e.target.value)} className="bg-[#241e33] rounded-lg p-2 text-sm border border-white/10">
          <option value="">All types</option>
          <option value="chat_message">Chat</option>
          <option value="fan_art">Fan-art</option>
          <option value="review">Review</option>
          <option value="user">User</option>
        </select>
      </div>
      {loading ? <p className="text-white/50">Loading…</p> : reports.length === 0 ? <p className="text-white/50">No reports.</p> : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.report_id} className="bg-[#241e33] rounded-xl p-4 border border-white/10">
              <div className="flex justify-between items-start gap-4">
                <div className="text-sm">
                  <span className="inline-block px-2 py-0.5 rounded bg-white/10 text-xs mr-2">{r.target_type}</span>
                  <span className="text-[#FF4E27]">{r.reason}</span>
                  <span className={`ml-2 text-xs ${r.status === "open" ? "text-yellow-400" : "text-white/40"}`}>{r.status}</span>
                  <div className="text-white/50 text-xs mt-1">target: {r.target_id}</div>
                  {r.details && <p className="text-white/70 mt-1">{r.details}</p>}
                  <div className="text-white/40 text-xs mt-1">by {r.reporter?.username || r.reporter_user_id} · {new Date(r.created_at).toLocaleString()}</div>
                </div>
                {r.status === "open" && (
                  <div className="flex flex-col gap-1 shrink-0">
                    {r.target_type === "user"
                      ? <button onClick={() => ban(r)} className="text-xs px-3 py-1 rounded bg-red-500/80 hover:bg-red-500">Ban user</button>
                      : <button onClick={() => hide(r)} className="text-xs px-3 py-1 rounded bg-red-500/80 hover:bg-red-500">Hide content</button>}
                    <button onClick={() => dismiss(r)} className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20">Dismiss</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`, { credentials: "include" });
    const data = await res.json();
    setUsers(data.users || []);
  }, [q]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const toggleBan = async (u: AdminUser) => {
    try {
      await post(u.is_banned ? "/api/admin/unban-user" : "/api/admin/ban-user", { user_id: u.user_id });
      toast.success(u.is_banned ? "Unbanned" : "Banned");
      load();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search username or email…" className="w-full bg-[#241e33] rounded-lg p-2 text-sm border border-white/10 mb-4" />
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.user_id} className="bg-[#241e33] rounded-lg p-3 border border-white/10 flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">{u.username}</span>
              {u.is_admin && <span className="ml-2 text-xs text-[#FF4E27]">admin</span>}
              {u.is_banned && <span className="ml-2 text-xs text-red-400">banned</span>}
              <div className="text-white/40 text-xs">{u.email}</div>
            </div>
            {!u.is_admin && (
              <button onClick={() => toggleBan(u)} className={`text-xs px-3 py-1 rounded ${u.is_banned ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-500"}`}>
                {u.is_banned ? "Unban" : "Ban"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditTab() {
  const [actions, setActions] = useState<Action[]>([]);
  useEffect(() => {
    fetch("/api/admin/actions", { credentials: "include" }).then((r) => r.json()).then((d) => setActions(d.actions || []));
  }, []);
  return (
    <div className="space-y-2">
      {actions.length === 0 ? <p className="text-white/50">No actions yet.</p> : actions.map((a) => (
        <div key={a.action_id} className="bg-[#241e33] rounded-lg p-3 border border-white/10 text-sm flex justify-between">
          <span><span className="text-[#FF4E27]">{a.action}</span> {a.target_type} <span className="text-white/40">{a.target_id}</span></span>
          <span className="text-white/40 text-xs">{a.moderator_username || "?"} · {new Date(a.created_at).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
