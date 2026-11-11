"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import { Tips } from "@/components/Tour";

type M = { id: string; name: string; email: string | null; phone: string | null; message: string; read: boolean; created_at: string };
const btn = "bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold";

function Inbox() {
  const [rows, setRows] = useState<M[]>([]);
  const [msg, setMsg] = useState("");
  const load = async () => {
    const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) setMsg(error.message);
    setRows((data as M[]) ?? []);
  };
  useEffect(() => { load(); }, []);
  const mark = async (m: M, read: boolean) => {
    await supabase.from("messages").update({ read }).eq("id", m.id);
    setRows((r) => r.map((x) => (x.id === m.id ? { ...x, read } : x)));
  };
  const del = async (m: M) => {
    if (!confirm("Delete this message?")) return;
    await supabase.from("messages").delete().eq("id", m.id);
    setRows((r) => r.filter((x) => x.id !== m.id));
  };
  const unread = rows.filter((r) => !r.read).length;
  return (
    <div>
      <h1 className="font-serif text-3xl text-gold">Messages</h1>
      <div className="mt-3"><Tips id="messages" items={["Tap Email, WhatsApp or Call to reply from here.", "Mark read to clear the number on the menu."]} /></div>
      <p className="mt-1 text-sm text-muted">{rows.length} messages, {unread} unread. They come from the Contact page of your website.</p>
      <p className="text-sm text-red-400">{msg}</p>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {rows.map((m) => {
          const digits = (m.phone ?? "").replace(/\D/g, "");
          return (
            <article key={m.id} className={`r-card border bg-card p-4 ${m.read ? "bd-gold-20" : "border-em"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-serif text-xl text-gold">{m.name}{!m.read && <span className="ml-2 rounded-full bg-em px-2 text-xs text-black">new</span>}</h2>
                <span className="text-xs text-muted">{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <p className="my-3 whitespace-pre-line break-words text-fg">{m.message}</p>
              <div className="flex flex-wrap gap-2">
                {m.email && <a className={btn} href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}>Email</a>}
                {digits.length >= 8 && <a className={btn} href={`https://wa.me/${digits}`} target="_blank" rel="noopener">WhatsApp</a>}
                {m.phone && <a className={btn} href={`tel:${m.phone}`}>Call</a>}
                <button className={btn} onClick={() => mark(m, !m.read)}>{m.read ? "Mark unread" : "Mark read"}</button>
                <button className={btn} onClick={() => del(m)}>Delete</button>
              </div>
              <p className="mt-2 text-xs text-muted">{[m.email, m.phone].filter(Boolean).join(" · ")}</p>
            </article>
          );
        })}
      </div>
      {!rows.length && <p className="mt-6 text-muted">No messages yet.</p>}
    </div>
  );
}

export default function Page() { return <Gate><Inbox /></Gate>; }
