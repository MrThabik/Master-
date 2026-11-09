"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Settings } from "@/lib/settings";
import { useVoice } from "@/hooks/useVoice";

const IDEAS = ["Make the website royal purple and gold", "Use a bold modern heading font", "Hide the 3D cards and show 3 cards per row", "Move the navigation to the top", "Make the corners more rounded"];
type Proposal = { summary: string; changes: Partial<Settings> };

// Describe a change in your own words (type or speak). It shows what it would change; nothing is saved until you press Save.
export default function AiHelper({ values, onApply }: { values: Settings; onApply: (c: Partial<Settings>) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Proposal | null>(null);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const [lang, setLang] = useState("en-IN");
  const vals = useRef(values);
  vals.current = values;

  const ask = async (instruction: string) => {
    if (!instruction.trim()) return;
    setBusy(true); setErr(""); setRes(null); setDone("");
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify({ instruction, current: vals.current }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (!r || !r.ok) {
      setErr(j.error === "no_key" ? "The AI helper is not set up yet. Add ANTHROPIC_API_KEY in Vercel (see the README), then redeploy." : j.error === "limit" ? "Too many requests this hour. Try again later." : "The AI helper could not answer. Try again.");
      return;
    }
    setRes({ summary: j.summary, changes: j.changes ?? {} });
  };
  const voice = useVoice((t) => { setText(t); ask(t); }, lang);
  const askRef = useRef(ask);
  askRef.current = ask;
  useEffect(() => {
    const on = (e: Event) => { const t = String((e as CustomEvent).detail ?? ""); setText(t); askRef.current(t); };
    window.addEventListener("admin-voice", on);
    return () => window.removeEventListener("admin-voice", on);
  }, []);

  const entries = res ? Object.entries(res.changes) : [];
  const show = (x: unknown) => (typeof x === "string" && x.length > 40 ? x.slice(0, 40) + "…" : String(x));
  return (
    <section className="bd-gold-25 r-card border bg-card p-4" data-tour="ai">
      <h2 className="font-serif text-xl text-gold">AI helper</h2>
      <p className="text-xs text-muted">Describe a change in English or Tamil. It shows what it would change, and you decide.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="For example: make the website royal purple and gold" aria-label="Describe a change"
        className="bd-gold-30 mt-2 min-h-[80px] w-full rounded-lg border bg-field p-2.5 text-base text-fg sm:text-sm" />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button disabled={busy} onClick={() => ask(text)} className="border-em rounded-full border px-5 py-2 text-sm text-em disabled:opacity-50">{busy ? "Thinking…" : "Suggest changes"}</button>
        {voice.supported && (
          <>
            <select aria-label="Voice language" value={lang} onChange={(e) => setLang(e.target.value)} className="bd-gold-30 rounded-full border bg-field px-3 py-2 text-xs text-fg"><option value="en-IN">English</option><option value="ta-IN">தமிழ்</option></select>
            <button onClick={() => (voice.on ? voice.stop() : voice.start())} className={`bd-gold-40 rounded-full border px-4 py-2 text-sm ${voice.on ? "bg-em text-black" : "text-gold"}`}>{voice.on ? "Listening…" : "🎤 Speak"}</button>
          </>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">{IDEAS.map((i) => <button key={i} className="bd-gold-25 rounded-full border px-3 py-1 text-xs text-muted" onClick={() => setText(i)}>{i}</button>)}</div>
      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      {res && (
        <div className="bd-gold-30 mt-3 rounded-lg border p-3">
          <p className="text-sm text-fg">{res.summary}</p>
          {entries.length > 0 ? (
            <>
              <ul className="mt-2 grid gap-1 text-xs text-muted">
                {entries.map(([k, nv]) => <li key={k}><b className="text-gold">{k}</b>: {show((values as unknown as Record<string, unknown>)[k])} → <span className="text-em">{show(nv)}</span></li>)}
              </ul>
              <div className="mt-3 flex gap-2">
                <button className="border-em rounded-full border px-5 py-2 text-sm text-em" onClick={() => { onApply(res.changes); setRes(null); setDone("Applied. Check the preview, then press Save changes. Undo is in the bottom bar."); }}>Apply to editor</button>
                <button className="bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold" onClick={() => setRes(null)}>Discard</button>
              </div>
            </>
          ) : <p className="mt-1 text-xs text-muted">No changes were suggested.</p>}
        </div>
      )}
      {done && <p className="mt-3 text-sm text-em">{done}</p>}
    </section>
  );
}
