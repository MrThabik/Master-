"use client";
import { useState } from "react";

export type Mood = { id: string; caption: string; url: string };

export default function Moodboard({ items }: { items: Mood[] }) {
  const [sel, setSel] = useState<Mood | null>(null);
  return (
    <>
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
        {items.map((m) => (
          <figure key={m.id} onClick={() => setSel(m)} className="group relative cursor-zoom-in overflow-hidden rounded-xl border bd-gold-20">
            <img src={m.url} alt={m.caption} loading="lazy" className="w-full transition duration-500 group-hover:scale-105" />
            {m.caption && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-2 text-xs text-white opacity-0 transition group-hover:opacity-100">{m.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {!items.length && <p className="text-center text-muted">No photos yet. Add some in Developer Space.</p>}
      {sel && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/90 p-4" onClick={() => setSel(null)}>
          <div className="text-center">
            <img src={sel.url} alt={sel.caption} className="max-h-[80vh] max-w-full rounded-lg" />
            {sel.caption && <p className="mt-3 font-serif text-xl text-gold">{sel.caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}
