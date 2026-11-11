"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import { Tips } from "@/components/Tour";

type S = { id: string; email: string; created_at: string };
const btn = "bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold";

function List() {
  const [rows, setRows] = useState<S[]>([]);
  const [msg, setMsg] = useState("");
  const load = async () => {
    const { data, error } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false }).limit(5000);
    if (error) setMsg(error.message);
    setRows((data as S[]) ?? []);
  };
  useEffect(() => { load(); }, []);
  const del = async (s: S) => {
    if (!confirm(`Remove ${s.email}?`)) return;
    await supabase.from("subscribers").delete().eq("id", s.id);
    setRows((r) => r.filter((x) => x.id !== s.id));
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(rows.map((r) => r.email).join(", ")); setMsg("All emails copied. Paste them into the BCC box of your email."); }
    catch { setMsg("Copy failed. Use Download CSV instead."); }
  };
  const csv = () => {
    const body = "email,subscribed_at\n" + rows.map((r) => `${r.email},${r.created_at}`).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
    a.download = "subscribers.csv";
    a.click();
  };
  return (
    <div>
      <h1 className="font-serif text-3xl text-gold">Subscribers</h1>
      <div className="mt-3"><Tips id="subscribers" items={["Copy all emails and paste them into the BCC box when you announce a new post.", "Remove anyone who asks to stop."]} /></div>
      <p className="mt-1 text-sm text-muted">{rows.length} people asked for new blog posts. When you publish a post, send them a short email with the link (use BCC so nobody sees the others). If someone asks to stop, remove them here.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className={btn} onClick={copy}>Copy all emails</button>
        <button className={btn} onClick={csv}>Download CSV</button>
      </div>
      <p className="mt-2 text-sm text-em">{msg}</p>
      <ul className="mt-4 grid gap-2 xl:grid-cols-2">
        {rows.map((s) => (
          <li key={s.id} className="bd-gold-20 r-card flex items-center justify-between gap-3 border bg-card px-4 py-3">
            <span className="min-w-0 break-all text-fg">{s.email}<span className="block text-xs text-muted">{new Date(s.created_at).toLocaleDateString()}</span></span>
            <button className={btn} onClick={() => del(s)}>Remove</button>
          </li>
        ))}
      </ul>
      {!rows.length && <p className="mt-6 text-muted">No subscribers yet.</p>}
    </div>
  );
}

export default function Page() { return <Gate><List /></Gate>; }
