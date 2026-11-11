"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import { Tips } from "@/components/Tour";

type V = { id: number; data: Record<string, unknown>; created_at: string };
const btn = "bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold";

function History() {
  const [rows, setRows] = useState<V[]>([]);
  const [cur, setCur] = useState<Record<string, unknown>>({});
  const [msg, setMsg] = useState("");
  const load = async () => {
    const [a, b] = await Promise.all([
      supabase.from("settings_versions").select("id,data,created_at").order("id", { ascending: false }).limit(30),
      supabase.from("settings").select("data").eq("id", 1).single(),
    ]);
    if (a.error) setMsg("History is empty or not set up yet. Run the Update 5 SQL in Supabase, then save once in Design or Settings.");
    setRows((a.data as V[]) ?? []);
    setCur((b.data?.data as Record<string, unknown>) ?? {});
  };
  useEffect(() => { load(); }, []);
  const diff = (d: Record<string, unknown>) => Object.keys({ ...cur, ...d }).filter((k) => JSON.stringify(cur[k]) !== JSON.stringify(d[k]));
  const restore = async (v: V) => {
    if (!confirm("Restore this version? Your current settings are kept in History too.")) return;
    setMsg("Restoring…");
    const { error } = await supabase.from("settings").upsert({ id: 1, data: v.data, updated_at: new Date().toISOString() });
    if (error) { setMsg(error.message); return; }
    await supabase.from("settings_versions").insert({ data: v.data });
    const { data } = await supabase.auth.getSession();
    await fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${data.session?.access_token}` } }).catch(() => null);
    setMsg("Restored. The public website is updated.");
    load();
  };
  return (
    <div>
      <h1 className="adm-title font-serif text-3xl">History</h1>
      <p className="mt-1 text-sm text-muted">Each time you save Design & Layout or Site Settings, that version is kept (the latest 30). Restore any of them with one tap.</p>
      <div className="mt-4"><Tips id="history" items={["The newest version is at the top and is usually the one that is live now.", "“Differs in” shows which settings would change if you restore that version.", "Restoring does not delete anything: your current version is saved in History first."]} /></div>
      <p className="text-sm text-em">{msg}</p>
      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        {rows.map((v, i) => {
          const d = diff(v.data);
          return (
            <article key={v.id} className="bd-gold-25 r-card adm-card border bg-card p-4">
              <p className="font-serif text-xl text-gold">{new Date(v.created_at).toLocaleString()}{i === 0 && <span className="ml-2 rounded-full bg-em px-2 text-xs text-black">newest</span>}</p>
              <p className="mt-1 text-sm text-muted">{d.length === 0 ? "Same as the live version." : `Differs in ${d.length}: ${d.slice(0, 6).join(", ")}${d.length > 6 ? "…" : ""}`}</p>
              <button className={`${btn} mt-3`} disabled={d.length === 0} onClick={() => restore(v)}>Restore this version</button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() { return <Gate><History /></Gate>; }
