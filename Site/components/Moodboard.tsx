"use client";
import { useEffect, useState } from "react";

export type Mood = { id: string; caption: string; url: string };
export type MoodOpts = { layout: string; columns: number; gap: number; radius: number; hover: string; caption: string; frame: string; shuffle: boolean };

export default function Moodboard({ items, opts }: { items: Mood[]; opts: MoodOpts }) {
  const [list, setList] = useState(items);
  const [sel, setSel] = useState<Mood | null>(null);
  useEffect(() => { if (opts.shuffle) setList([...items].sort(() => Math.random() - 0.5)); else setList(items); }, [items, opts.shuffle]);

  const frame = opts.frame === "border" ? "border-2 border-gold p-1 bg-card" : opts.frame === "polaroid" ? "bg-white p-2 pb-8 shadow-lg" : "";
  const hover = opts.hover === "zoom" ? "group-hover:scale-105" : opts.hover === "lift" ? "" : "";
  const cap = (m: Mood) => opts.caption !== "hidden" && m.caption ? (
    opts.frame === "polaroid"
      ? <figcaption className="absolute inset-x-2 bottom-1 text-center text-xs text-black">{m.caption}</figcaption>
      : <figcaption className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-2 text-xs text-white transition ${opts.caption === "always" ? "" : "opacity-0 group-hover:opacity-100"}`}>{m.caption}</figcaption>
  ) : null;
  const fig = (m: Mood, extra = "") => (
    <figure key={m.id} onClick={() => setSel(m)} style={{ borderRadius: opts.radius }} className={`group relative cursor-zoom-in overflow-hidden transition duration-300 ${opts.hover === "lift" ? "hover:-translate-y-1 hover:shadow-xl" : ""} ${frame} ${extra}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={m.url} alt={m.caption} loading="lazy" style={{ borderRadius: Math.max(0, opts.radius - 4) }} className={`${opts.layout === "masonry" ? "w-full" : "h-full w-full object-cover"} transition duration-500 ${hover}`} />
      {cap(m)}
    </figure>
  );
  const g = { gap: opts.gap };
  return (
    <>
      {opts.layout === "masonry" && <div style={{ columnCount: opts.columns, columnGap: opts.gap }} className="[&>*]:mb-[var(--mg)]"><style>{`:root{--mg:${opts.gap}px}@media(max-width:640px){.mood-cols{column-count:2!important}}`}</style>{list.map((m) => fig(m, "mb-[var(--mg)] break-inside-avoid"))}</div>}
      {opts.layout === "grid" && <div className="grid" style={{ ...g, gridTemplateColumns: `repeat(auto-fill, minmax(${Math.round(1100 / Math.max(1, opts.columns))}px, 1fr))` }}>{list.map((m) => fig(m, "aspect-square"))}</div>}
      {opts.layout === "strip" && <div className="flex snap-x overflow-x-auto pb-4" style={g}>{list.map((m) => fig(m, "h-72 w-60 shrink-0 snap-center sm:h-96 sm:w-72"))}</div>}
      {!list.length && <p className="text-center text-muted">No photos yet. Add some in Developer Space.</p>}
      {sel && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/90 p-4" onClick={() => setSel(null)}>
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sel.url} alt={sel.caption} className="max-h-[80vh] max-w-full rounded-lg" />
            {sel.caption && <p className="mt-3 font-serif text-xl text-gold">{sel.caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}
