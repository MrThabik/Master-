"use client";
import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import AdminShell from "@/components/AdminShell";

const IDLE_MS = 15 * 60 * 1000; // auto sign-out after 15 minutes of no activity

// Admin-only gate: username + password + PIN, checked on the server.
export default function Gate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [u, setU] = useState("");
  const [pw, setPw] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setOk(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setOk(!!s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ok) return;
    const out = () => supabase.auth.signOut();
    let t = setTimeout(out, IDLE_MS);
    const reset = () => { clearTimeout(t); t = setTimeout(out, IDLE_MS); };
    const ev = ["pointerdown", "keydown", "scroll"];
    ev.forEach((e) => window.addEventListener(e, reset));
    return () => { clearTimeout(t); ev.forEach((e) => window.removeEventListener(e, reset)); };
  }, [ok]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: pw, pin }),
    });
    const j = await r.json().catch(() => ({}));
    setPw(""); setPin("");
    if (!r.ok) { setErr(j.error || "Access denied"); setBusy(false); return; }
    await supabase.auth.setSession({ access_token: j.access_token, refresh_token: j.refresh_token });
    setBusy(false);
  }

  if (ok === null) return null;
  if (!ok)
    return (
      <form onSubmit={submit} autoComplete="off" className="mx-auto mt-24 grid max-w-sm gap-3 rounded-2xl border bd-gold-30 bg-card p-6">
        <h1 className="font-serif text-2xl text-gold">Admin access</h1>
        <p className="text-xs text-muted">Private area. Authorised administrator only.</p>
        <input className="rounded-lg bg-field p-2" placeholder="Username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={u} onChange={(e) => setU(e.target.value)} />
        <input className="rounded-lg bg-field p-2" type="password" placeholder="Password" autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw} onChange={(e) => setPw(e.target.value)} />
        <input className="rounded-lg bg-field p-2 tracking-[.4em]" type="password" inputMode="numeric" placeholder="PIN" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
        <button disabled={busy} className="rounded-full border border-em py-2 text-em disabled:opacity-50">{busy ? "Checking…" : "Unlock"}</button>
        <p className="min-h-[20px] text-sm text-red-400">{err}</p>
      </form>
    );
  return <AdminShell>{children}</AdminShell>;
}
