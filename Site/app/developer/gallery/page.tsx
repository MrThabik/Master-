"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import SaveBar from "@/components/SaveBar";
import { Tips } from "@/components/Tour";
import { useSettings } from "@/hooks/useSettings";
import { useDnD } from "@/hooks/useDnD";
import { albumList, type Settings } from "@/lib/settings";

type Row = { id: string; title: string; album: string; image_path: string; sort: number; width: number | null; height: number | null; fit: string; position: string; caption: string | null; link_url: string | null; hidden: boolean };
const inp = "rounded-lg border bd-gold-30 bg-field p-2.5 text-base text-fg sm:text-sm";
const btn = "bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold";
const publicUrl = (p: string) => supabase.storage.from("gallery").getPublicUrl(p).data.publicUrl;
const measure = (src: string) => new Promise<{ w: number; h: number }>((res) => { const i = new Image(); i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => res({ w: 0, h: 0 }); i.src = src; });
const shape = (r: Row) => (!r.width || !r.height ? "Unknown shape" : r.width / r.height > 1.05 ? "Landscape" : r.width / r.height < 0.95 ? "Portrait" : "Square");
const sqlHint = (m: string) => (/column|schema cache|constraint/i.test(m) ? "Run the Update 6 SQL in Supabase first (adds caption, link, hide and free album names), then try again." : m);

function Manager() {
  const S = useSettings();
  const { v, set } = S;
  const albums = albumList(v.gallery_albums);
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [bulkAlbum, setBulkAlbum] = useState("");

  const load = async () => {
    const { data } = await supabase.from("artworks").select("*").order("sort");
    const list = (data as Row[]) ?? [];
    setRows(list);
    for (const r of list.filter((x) => !x.width)) {
      const m = await measure(publicUrl(r.image_path));
      if (m.w) { await supabase.from("artworks").update({ width: m.w, height: m.h }).eq("id", r.id); setRows((c) => c.map((x) => (x.id === r.id ? { ...x, width: m.w, height: m.h } : x))); }
    }
  };
  useEffect(() => { load(); }, []);

  const edit = (id: string, p: Partial<Row>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const upload = async (files: FileList) => {
    setMsg("Uploading…");
    let n = rows.length;
    for (const f of Array.from(files)) {
      const local = URL.createObjectURL(f);
      const m = await measure(local);
      URL.revokeObjectURL(local);
      const path = `${crypto.randomUUID()}-${f.name.replace(/[^\w.-]/g, "_")}`;
      const up = await supabase.storage.from("gallery").upload(path, f);
      if (up.error) { setMsg(up.error.message); return; }
      const ins = await supabase.from("artworks").insert({ title: f.name.replace(/\.[^.]+$/, ""), album: albums[0], image_path: path, sort: n++, width: m.w || null, height: m.h || null });
      if (ins.error) { setMsg(sqlHint(ins.error.message)); return; }
    }
    setMsg("Uploaded. Landscape and portrait photos are both supported.");
    load();
  };
  const save = async (x: Row) => {
    const { error } = await supabase.from("artworks").update({ title: x.title, album: x.album, fit: x.fit, position: x.position, caption: x.caption || null, link_url: x.link_url || null, hidden: x.hidden }).eq("id", x.id);
    setMsg(error ? sqlHint(error.message) : `Saved ${x.title}`);
  };
  const del = async (x: Row) => { if (!confirm("Delete this photo?")) return; await supabase.storage.from("gallery").remove([x.image_path]); await supabase.from("artworks").delete().eq("id", x.id); load(); };
  const reorder = async (next: Row[]) => { setRows(next); await Promise.all(next.map((x, k) => supabase.from("artworks").update({ sort: k }).eq("id", x.id))); };
  const dnd = useDnD(rows, reorder);
  const move = (i: number, d: number) => { const a = [...rows]; if (!a[i + d]) return; [a[i], a[i + d]] = [a[i + d], a[i]]; reorder(a); };
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const bulk = async (patch: Partial<Row>) => {
    const { error } = await supabase.from("artworks").update(patch).in("id", picked);
    setMsg(error ? sqlHint(error.message) : `Updated ${picked.length} photos`);
    setRows((r) => r.map((x) => (picked.includes(x.id) ? { ...x, ...patch } : x)));
  };
  const bulkDel = async () => {
    if (!confirm(`Delete ${picked.length} photos?`)) return;
    const gone = rows.filter((x) => picked.includes(x.id));
    await supabase.storage.from("gallery").remove(gone.map((x) => x.image_path));
    await supabase.from("artworks").delete().in("id", picked);
    setPicked([]); load();
  };
  const L = <K extends keyof Settings>(k: K) => (e: { target: { value: string } }) => set(k, e.target.value as Settings[K]);
  const Ln = <K extends keyof Settings>(k: K) => (e: { target: { value: string } }) => set(k, Number(e.target.value) as Settings[K]);
  const Lc = <K extends keyof Settings>(k: K) => (e: { target: { checked: boolean } }) => set(k, e.target.checked as Settings[K]);
  const chk = "flex items-center gap-3 text-sm text-fg";

  return (
    <div>
      <h1 className="font-serif text-3xl text-gold">Gallery Manager</h1>
      <div className="mt-3"><Tips id="gallery" items={["Gallery look: choose a cinematic slider or a photo wall, the change effect, speed, caption, arrows and watermark, then press Save changes at the bottom.", "Albums are yours to name: type them separated by commas. Photos keep the album you gave them.", "Select photos with the tick box to move, hide, show or delete many at once.", "Per photo: Size Auto is best; Show whole photo never crops; Focus decides what stays visible when cropped.", "Drag a photo card (laptop) or use ↑ ↓ to change the order."]} /></div>

      <section className="bd-gold-25 mt-4 grid gap-3 rounded-xl border p-4 md:grid-cols-2 xl:grid-cols-3">
        <h2 className="font-serif text-2xl text-gold md:col-span-2 xl:col-span-3">Gallery look</h2>
        <label className="grid gap-1 text-sm text-muted">Layout<select className={inp} value={v.gallery_layout} onChange={L("gallery_layout")}><option value="slider">Cinematic slider</option><option value="masonry">Photo wall</option></select></label>
        <label className="grid gap-1 text-sm text-muted">Change effect<select className={inp} value={v.gallery_transition} onChange={L("gallery_transition")}><option value="fade">Fade</option><option value="slide">Slide</option><option value="zoom">Zoom</option><option value="none">None</option></select></label>
        <label className="grid gap-1 text-sm text-muted">Letterbox for whole photos<select className={inp} value={v.gallery_whole_bg} onChange={L("gallery_whole_bg")}><option value="blur">Blurred copy of the photo</option><option value="black">Plain black</option></select></label>
        <label className="grid gap-1 text-sm text-muted">Seconds per photo: {v.gallery_seconds}<input type="range" min={3} max={20} value={v.gallery_seconds} onChange={Ln("gallery_seconds")} className="h-8" /></label>
        <label className="grid gap-1 text-sm text-muted">Dark shade strength: {v.gallery_overlay}%<input type="range" min={0} max={100} value={v.gallery_overlay} onChange={Ln("gallery_overlay")} className="h-8" /></label>
        <label className="grid gap-1 text-sm text-muted">Watermark strength: {v.watermark_opacity}%<input type="range" min={0} max={40} value={v.watermark_opacity} onChange={Ln("watermark_opacity")} className="h-8" /></label>
        <label className="grid gap-1 text-sm text-muted md:col-span-2">Watermark text (empty = none)<input className={inp} value={v.watermark_text} onChange={L("watermark_text")} /></label>
        <label className="grid gap-1 text-sm text-muted xl:col-span-3">Albums, separated by commas<input className={inp} value={v.gallery_albums} onChange={L("gallery_albums")} /></label>
        <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.gallery_autoplay} onChange={Lc("gallery_autoplay")} /> Change photos automatically</label>
        <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.gallery_zoom} onChange={Lc("gallery_zoom")} /> Slow zoom effect</label>
        <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.gallery_arrows} onChange={Lc("gallery_arrows")} /> Show arrows</label>
        <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.gallery_caption} onChange={Lc("gallery_caption")} /> Show titles and captions</label>
      </section>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className={`${btn} cursor-pointer`}>Upload photos<input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} /></label>
        <button className={btn} onClick={() => setPicked(picked.length === rows.length ? [] : rows.map((r) => r.id))}>{picked.length === rows.length && rows.length ? "Select none" : "Select all"}</button>
        {picked.length > 0 && (
          <>
            <span className="text-sm text-gold">{picked.length} selected</span>
            <select className={inp} value={bulkAlbum} onChange={(e) => setBulkAlbum(e.target.value)}><option value="">Move to album…</option>{albums.map((a) => <option key={a}>{a}</option>)}</select>
            <button className={btn} disabled={!bulkAlbum} onClick={() => bulk({ album: bulkAlbum })}>Move</button>
            <button className={btn} onClick={() => bulk({ hidden: true })}>Hide</button>
            <button className={btn} onClick={() => bulk({ hidden: false })}>Show</button>
            <button className={btn} onClick={bulkDel}>Delete</button>
          </>
        )}
      </div>
      <p className="mt-2 text-sm text-em">{msg}</p>

      <div className="mt-3 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {rows.map((x, i) => (
          <div key={x.id} {...dnd(i)} className={`grid content-start gap-2 rounded-xl border p-3 ${x.hidden ? "bd-gold-20 opacity-60" : "bd-gold-25"}`}>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="h-5 w-5" checked={picked.includes(x.id)} onChange={() => toggle(x.id)} aria-label="Select" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicUrl(x.image_path)} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <div className="text-sm text-muted">{shape(x)}{x.width ? ` · ${x.width}×${x.height}` : ""}{x.hidden ? " · hidden" : ""}</div>
            </div>
            <input className={`${inp} w-full`} value={x.title} onChange={(e) => edit(x.id, { title: e.target.value })} placeholder="Title" />
            <textarea className={`${inp} min-h-[60px] w-full`} value={x.caption ?? ""} onChange={(e) => edit(x.id, { caption: e.target.value })} placeholder="Caption (optional)" />
            <input className={`${inp} w-full`} value={x.link_url ?? ""} onChange={(e) => edit(x.id, { link_url: e.target.value })} placeholder="Link for “View more” (optional, https://…)" autoCapitalize="none" />
            <div className="flex flex-wrap gap-2">
              <select className={inp} value={x.album} onChange={(e) => edit(x.id, { album: e.target.value })}>{Array.from(new Set([...albums, x.album])).map((a) => <option key={a}>{a}</option>)}</select>
              <select className={inp} value={x.fit} onChange={(e) => edit(x.id, { fit: e.target.value })}><option value="auto">Size: Auto</option><option value="whole">Size: Show whole photo</option><option value="fill">Size: Fill screen</option></select>
              <select className={inp} value={x.position} onChange={(e) => edit(x.id, { position: e.target.value })}><option value="top">Focus: Top</option><option value="center">Focus: Center</option><option value="bottom">Focus: Bottom</option></select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className={chk}><input type="checkbox" className="h-5 w-5" checked={x.hidden} onChange={(e) => edit(x.id, { hidden: e.target.checked })} /> Hide</label>
              <button className={btn} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button className={btn} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              <button className={btn} onClick={() => del(x)}>Delete</button>
              <button className="border-em rounded-full border px-4 py-2 text-sm text-em" onClick={() => save(x)}>Save</button>
            </div>
          </div>
        ))}
      </div>
      <SaveBar dirty={S.dirty} msg={S.msg} onSave={S.save} onUndo={S.undo} onRedo={S.redo} canUndo={S.canUndo} canRedo={S.canRedo} />
    </div>
  );
}

export default function Page() { return <Gate><Manager /></Gate>; }
