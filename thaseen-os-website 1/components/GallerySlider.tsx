"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Art = { id: string; title: string; album: string; url: string; likes: number; views: number; width: number | null; height: number | null; fit: string; position: string };
const ALBUMS = ["All", "Photography", "Digital Art", "Drawings & Paintings"];

export default function GallerySlider({ items, seconds = 7, zoom = true, wmText = "© THASEEN SHABIK", wmOpacity = 12 }: { items: Art[]; seconds?: number; zoom?: boolean; wmText?: string; wmOpacity?: number }) {
  const [data, setData] = useState(items);
  const [album, setAlbum] = useState("All");
  const [i, setI] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const seen = useRef(new Set<string>());
  const [vp, setVp] = useState(1.6); // screen shape: wide (>1) or tall (<1)
  useEffect(() => {
    const f = () => setVp(window.innerWidth / window.innerHeight);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  // "whole" shows the full photo over a blurred copy; "fill" covers the screen. Auto picks by shape.
  const fitMode = (a: Art) => {
    if (a.fit === "whole" || a.fit === "fill") return a.fit;
    if (!a.width || !a.height) return "fill";
    const r = a.width / a.height / vp;
    return r >= 0.65 && r <= 1.5 ? "fill" : "whole";
  };

  const list = album === "All" ? data : data.filter((a) => a.album === album);
  const cur = list.length ? list[((i % list.length) + list.length) % list.length] : null;

  useEffect(() => { try { setLiked(JSON.parse(localStorage.getItem("liked") || "[]")); } catch {} }, []);
  useEffect(() => { const t = setInterval(() => setI((n) => n + 1), seconds * 1000); return () => clearInterval(t); }, [album, seconds]);

  // Shared view counter: once per artwork per visit
  useEffect(() => {
    if (!cur || seen.current.has(cur.id)) return;
    seen.current.add(cur.id);
    supabase.rpc("add_view", { p_art: cur.id }).then(({ data: v }) => {
      if (typeof v === "number") setData((d) => d.map((a) => (a.id === cur.id ? { ...a, views: v } : a)));
    });
  }, [cur?.id]);

  const like = async () => {
    if (!cur) return;
    let vid = localStorage.getItem("vid");
    if (!vid) { vid = crypto.randomUUID(); localStorage.setItem("vid", vid); }
    const { data: n } = await supabase.rpc("toggle_like", { p_art: cur.id, p_visitor: vid });
    if (typeof n === "number") setData((d) => d.map((a) => (a.id === cur.id ? { ...a, likes: n } : a)));
    const next = liked.includes(cur.id) ? liked.filter((x) => x !== cur.id) : [...liked, cur.id];
    setLiked(next);
    localStorage.setItem("liked", JSON.stringify(next));
  };

  return (
    <div className="fixed inset-0 select-none bg-[#050605] text-[#f2efe6]" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}>
      <style>{`@keyframes kb{from{transform:scale(1)}to{transform:scale(1.08)}}@keyframes fi{from{opacity:0}to{opacity:1}}`}</style>
      {cur ? (
        <div key={cur.id} className="absolute inset-0" style={{ animation: "fi 1.2s both" }}>
          {fitMode(cur) === "whole" ? (
            <>
              <div className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-2xl" style={{ backgroundImage: `url(${cur.url})` }} />
              <img src={cur.url} alt={cur.title} draggable={false} className="absolute inset-0 h-full w-full object-contain" style={zoom ? { animation: "kb 14s ease-out both" } : undefined} />
            </>
          ) : (
            <div className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${cur.url})`, backgroundPosition: cur.position === "top" ? "center top" : cur.position === "bottom" ? "center bottom" : "center", animation: zoom ? "kb 14s ease-out both" : undefined }} />
          )}
        </div>
      ) : (
        <p className="grid h-full place-items-center font-serif text-2xl">No artworks in this album yet</p>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-transparent via-30% to-black/85" />
      {/* watermark */}
      {wmText && (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: wmOpacity / 100 }}>
        <div className="absolute -inset-1/2 -rotate-[30deg] text-center font-serif text-2xl leading-[120px] tracking-[.3em] text-white">
          {Array(60).fill(`${wmText}   `).join("")}
        </div>
      </div>
      )}
      <nav className="absolute inset-x-0 top-0 flex flex-wrap justify-center gap-2 px-3 pt-[calc(16px+env(safe-area-inset-top,0px))]">
        {ALBUMS.map((a) => (
          <button key={a} onClick={() => { setAlbum(a); setI(0); }} className={`rounded-full border bd-gold-30 px-4 py-1 text-xs backdrop-blur ${a === album ? "bg-gold text-black" : "bg-black/45"}`}>{a}</button>
        ))}
      </nav>
      <button onClick={() => setI(i - 1)} className="absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border bd-gold-40 bg-black/40 text-2xl text-gold">‹</button>
      <button onClick={() => setI(i + 1)} className="absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border bd-gold-40 bg-black/40 text-2xl text-gold">›</button>
      {cur && (
        <div className="absolute bottom-[calc(104px+env(safe-area-inset-bottom,0px))] left-0 max-w-xl px-6">
          <small className="text-[11px] uppercase tracking-[.25em] text-emerald-400">{cur.album} · {list.indexOf(cur) + 1} / {list.length}</small>
          <h2 className="my-1 font-serif text-4xl">{cur.title}</h2>
          <button onClick={like} className={`rounded-full border border-gold px-4 py-1 text-sm ${liked.includes(cur.id) ? "bg-gold text-black" : "text-gold"}`}>
            {liked.includes(cur.id) ? "♥" : "♡"} {cur.likes}
          </button>
          <span className="ml-3 text-sm text-[#9aa39d]">{cur.views} views</span>
        </div>
      )}
    </div>
  );
}
