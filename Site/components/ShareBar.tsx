"use client";
import { useState } from "react";
import { U } from "@/components/T";

export default function ShareBar({ url, title }: { url: string; title: string }) {
  const [ok, setOk] = useState(false);
  const btn = "bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold";
  const copy = async () => { try { await navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 2000); } catch {} };
  const native = async () => { try { await navigator.share({ title, url }); } catch {} };
  return (
    <div className="my-6 flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted"><U k="share" />:</span>
      <a className={btn} target="_blank" rel="noopener" href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}>WhatsApp</a>
      <button className={btn} onClick={copy}>{ok ? <U k="copied" /> : <U k="copyLink" />}</button>
      {typeof navigator !== "undefined" && "share" in navigator && <button className={btn} onClick={native}>···</button>}
    </div>
  );
}
