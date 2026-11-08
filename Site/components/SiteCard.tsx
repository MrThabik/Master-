"use client";
import { useRef, useState } from "react";
import { supabase, type Site } from "@/lib/supabase";

const hostOf = (u: string) => { try { return new URL(u).host; } catch { return u; } };

export default function SiteCard({ s }: { s: Site }) {
  const [live, setLive] = useState(false);
  const [visits, setVisits] = useState(s.visits ?? 0);
  const box = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const scale = (box.current?.clientWidth ?? 320) / 1280;

  return (
    <article className="r-card bd-gold overflow-hidden bg-card backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(16,185,129,.15)]">
      <div
        ref={box}
        className="relative aspect-[16/10] overflow-hidden bg-[#0b1210]"
        onMouseEnter={() => s.live_preview && (timer.current = setTimeout(() => setLive(true), 450))}
        onMouseLeave={() => { clearTimeout(timer.current); setLive(false); }}
      >
        {s.screenshot_url ? (
          <img src={s.screenshot_url} alt={s.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center font-serif text-xl text-gold">{hostOf(s.url)}</div>
        )}
        {s.live_preview && <span className="absolute right-2 top-2 rounded-full border border-em bg-black/60 px-2 text-[11px] text-em">Live preview on hover</span>}
        {live && (
          <iframe
            src={s.url}
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
            className="pointer-events-none absolute left-0 top-0 h-[800px] w-[1280px] origin-top-left border-0 bg-white"
            style={{ transform: `scale(${scale})` }}
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-xl text-gold">{s.name}</h3>
        <p className="my-2 text-sm text-muted">{s.description}</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {s.tags.map((t) => <span key={t} className="rounded-full border bd-gold-25 px-2 text-xs">{t}</span>)}
        </div>
        <a href={s.url} target="_blank" rel="noopener" onClick={async () => { const { data } = await supabase.rpc("add_site_visit", { p_site: s.id }); if (typeof data === "number") setVisits(data); }} className="inline-block rounded-full border border-em px-4 py-2 text-sm text-em hover:bg-em hover:text-black">Visit website</a>
        <span className="ml-3 text-xs text-muted">{visits} visits</span>
      </div>
    </article>
  );
}
