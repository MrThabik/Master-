"use client";
import { useState } from "react";
import type { Art } from "@/components/GallerySlider";

// Alternative gallery layout: a wall of photos with a full-screen viewer
export default function GalleryMasonry({ items, albums, wmText, wmOpacity, caption }: { items: Art[]; albums: string[]; wmText: string; wmOpacity: number; caption: boolean }) {
  const [album, setAlbum] = useState("All");
  const [sel, setSel] = useState<Art | null>(null);
  const list = album === "All" ? items : items.filter((a) => a.album === album);
  const wm = wmText ? (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: wmOpacity / 100 }}>
      <div className="absolute -inset-1/2 -rotate-[30deg] text-center font-serif text-xl leading-[90px] tracking-[.3em] text-white">{Array(60).fill(`${wmText}   `).join("")}</div>
    </div>
  ) : null;
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-12" onContextMenu={(e) => e.preventDefault()}>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {["All", ...albums].map((a) => <button key={a} onClick={() => setAlbum(a)} className={`bd-gold-30 rounded-full border px-4 py-1 text-sm ${a === album ? "bg-gold text-black" : "text-fg"}`}>{a}</button>)}
      </div>
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
        {list.map((a) => (
          <figure key={a.id} onClick={() => setSel(a)} className="bd-gold-20 r-card group relative cursor-zoom-in overflow-hidden border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.url} alt={a.title} loading="lazy" draggable={false} className="w-full transition duration-500 group-hover:scale-105" />
            {wm}
            {caption && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-2 text-xs text-white opacity-0 transition group-hover:opacity-100">{a.title}</figcaption>}
          </figure>
        ))}
      </div>
      {!list.length && <p className="text-center text-muted">No photos in this album yet.</p>}
      {sel && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/92 p-4" onClick={() => setSel(null)}>
          <div className="relative text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sel.url} alt={sel.title} draggable={false} className="max-h-[82vh] max-w-full rounded-lg" />
            {wm}
            {caption && <p className="mt-3 font-serif text-2xl text-gold">{sel.title}</p>}
            {caption && sel.caption && <p className="text-sm text-white/80">{sel.caption}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
