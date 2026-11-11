"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import SaveBar from "@/components/SaveBar";
import { Tips } from "@/components/Tour";
import { useSettings } from "@/hooks/useSettings";
import { useDnD } from "@/hooks/useDnD";
import type { Settings } from "@/lib/settings";

type Row = { id: string; caption: string; image_path: string; sort: number; hidden: boolean };
const inp = "rounded-lg border bd-gold-30 bg-field p-2.5 text-base text-fg sm:text-sm";
const btn = "bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold";
const url = (p: string) => supabase.storage.from("gallery").getPublicUrl(p).data.publicUrl;
const sqlHint = (m: string) => (/column|schema cache/i.test(m) ? "Run the Update 6 SQL in Supabase first (adds the hide option), then try again." : m);
const TEMPLATES: Record<string, Partial<Settings>> = {
  "Polaroid wall": { mood_layout: "masonry", mood_frame: "polaroid", mood_columns: 3, mood_gap: 18, mood_radius: 4, mood_hover: "lift", mood_caption: "always" },
  "Clean masonry": { mood_layout: "masonry", mood_frame: "none", mood_columns: 4, mood_gap: 12, mood_radius: 12, mood_hover: "zoom", mood_caption: "hover" },
  "Tight mosaic": { mood_layout: "grid", mood_frame: "none", mood_columns: 5, mood_gap: 2, mood_radius: 0, mood_hover: "zoom", mood_caption: "hidden" },
  "Film strip": { mood_layout: "strip", mood_frame: "border", mood_columns: 1, mood_gap: 12, mood_radius: 6, mood_hover: "lift", mood_caption: "always" },
};

function Manager() {
  const S = useSettings();
  const { v, set, patch } = S;
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const load = async () => { const { data } = await supabase.from("moods").select("*").order("sort"); setRows((data as Row[]) ?? []); };
  useEffect(() => { load(); }, []);

  const edit = (id: string, p: Partial<Row>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const upload = async (files: FileList) => {
    setMsg("Uploading…");
    let n = rows.length;
    for (const f of Array.from(files)) {
      const path = `mood/${crypto.randomUUID()}-${f.name.replace(/[^\w.-]/g, "_")}`;
      const up = await supabase.storage.from("gallery").upload(path, f);
      if (up.error) { setMsg(up.error.message); return; }
      await supabase.from("moods").insert({ image_path: path, sort: n++ });
    }
    setMsg("Uploaded");
    load();
  };
  const save = async (x: Row) => { const { error } = await supabase.from("moods").update({ caption: x.caption, hidden: x.hidden }).eq("id", x.id); setMsg(error ? sqlHint(error.message) : "Saved"); };
  const del = async (x: Row) => { if (!confirm("Delete this photo?")) return; await supabase.storage.from("gallery").remove([x.image_path]); await supabase.from("moods").delete().eq("id", x.id); load(); };
  const reorder = async (next: Row[]) => { setRows(next); await Promise.all(next.map((x, k) => supabase.from("moods").update({ sort: k }).eq("id", x.id))); };
  const dnd = useDnD(rows, reorder);
  const move = (i: number, d: number) => { const a = [...rows]; if (!a[i + d]) return; [a[i], a[i + d]] = [a[i + d], a[i]]; reorder(a); };
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const bulkHide = async (hidden: boolean) => { const { error } = await supabase.from("moods").update({ hidden }).in("id", picked); setMsg(error ? sqlHint(error.message) : "Updated"); setRows((r) => r.map((x) => (picked.includes(x.id) ? { ...x, hidden } : x))); };
  const bulkDel = async () => {
    if (!confirm(`Delete ${picked.length} photos?`)) return;
    await supabase.storage.from("gallery").remove(rows.filter((x) => picked.includes(x.id)).map((x) => x.image_path));
    await supabase.from("moods").delete().in("id", picked);
    setPicked([]); load();
  };
  const L = <K extends keyof Settings>(k: K) => (e: { target: { value: string } }) => set(k, e.target.value as Settings[K]);
  const Ln = <K extends keyof Settings>(k: K) => (e: { target: { value: string } }) => set(k, Number(e.target.value) as Settings[K]);

  return (
    <div>
      <h1 className="font-serif text-3xl text-gold">Mood-board Manager</h1>
      <div className="mt-3"><Tips id="moodboard" items={["Pick a ready-made look (Polaroid wall, Clean masonry, Tight mosaic, Film strip), then fine-tune and press Save changes at the bottom.", "Captions are optional. They show on hover, always, or never, as you choose.", "Drag a photo (laptop) or use ↑ ↓ to reorder. Hide keeps a photo without showing it.", "Shuffle makes the wall appear in a new order on every visit."]} /></div>

      <section className="bd-gold-25 mt-4 grid gap-3 rounded-xl border p-4 md:grid-cols-2 xl:grid-cols-3">
        <h2 className="font-serif text-2xl text-gold md:col-span-2 xl:col-span-3">Mood-board look</h2>
        <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-3">{Object.entries(TEMPLATES).map(([n, t]) => <button key={n} className={btn} onClick={() => patch(t)}>{n}</button>)}</div>
        <label className="grid gap-1 text-sm text-muted">Page title<input className={inp} value={v.mood_title} onChange={L("mood_title")} /></label>
        <label className="grid gap-1 text-sm text-muted md:col-span-2">Intro text (optional)<input className={inp} value={v.mood_intro} onChange={L("mood_intro")} /></label>
        <label className="grid gap-1 text-sm text-muted">Layout<select className={inp} value={v.mood_layout} onChange={L("mood_layout")}><option value="masonry">Masonry wall</option><option value="grid">Equal squares</option><option value="strip">Film strip (scroll sideways)</option></select></label>
        <label className="grid gap-1 text-sm text-muted">Frame<select className={inp} value={v.mood_frame} onChange={L("mood_frame")}><option value="none">No frame</option><option value="border">Gold border</option><option value="polaroid">Polaroid</option></select></label>
        <label className="grid gap-1 text-sm text-muted">Hover effect<select className={inp} value={v.mood_hover} onChange={L("mood_hover")}><option value="zoom">Zoom</option><option value="lift">Lift</option><option value="none">None</option></select></label>
        <label className="grid gap-1 text-sm text-muted">Captions<select className={inp} value={v.mood_caption} onChange={L("mood_caption")}><option value="hover">On hover</option><option value="always">Always</option><option value="hidden">Never</option></select></label>
        <label className="grid gap-1 text-sm text-muted">Columns: {v.mood_columns}<input type="range" min={1} max={6} value={v.mood_columns} onChange={Ln("mood_columns")} className="h-8" /></label>
        <label className="grid gap-1 text-sm text-muted">Space between photos: {v.mood_gap}px<input type="range" min={0} max={40} value={v.mood_gap} onChange={Ln("mood_gap")} className="h-8" /></label>
        <label className="grid gap-1 text-sm text-muted">Corner roundness: {v.mood_radius}px<input type="range" min={0} max={40} value={v.mood_radius} onChange={Ln("mood_radius")} className="h-8" /></label>
        <label className="flex items-center gap-3 text-sm text-fg"><input type="checkbox" className="h-5 w-5" checked={v.mood_shuffle} onChange={(e) => set("mood_shuffle", e.target.checked)} /> Shuffle on every visit</label>
      </section>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className={`${btn} cursor-pointer`}>Upload photos<input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} /></label>
        <button className={btn} onClick={() => setPicked(picked.length === rows.length ? [] : rows.map((r) => r.id))}>{picked.length === rows.length && rows.length ? "Select none" : "Select all"}</button>
        {picked.length > 0 && (<><span className="text-sm text-gold">{picked.length} selected</span><button className={btn} onClick={() => bulkHide(true)}>Hide</button><button className={btn} onClick={() => bulkHide(false)}>Show</button><button className={btn} onClick={bulkDel}>Delete</button></>)}
      </div>
      <p className="mt-2 text-sm text-em">{msg}</p>

      <div className="mt-3 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {rows.map((x, i) => (
          <div key={x.id} {...dnd(i)} className={`flex flex-wrap items-center gap-2 rounded-xl border p-2 ${x.hidden ? "bd-gold-20 opacity-60" : "bd-gold-25"}`}>
            <input type="checkbox" className="h-5 w-5" checked={picked.includes(x.id)} onChange={() => toggle(x.id)} aria-label="Select" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url(x.image_path)} alt="" className="h-16 w-20 rounded-lg object-cover" />
            <input className={`${inp} min-w-[140px] flex-1`} value={x.caption ?? ""} placeholder="Caption (optional)" onChange={(e) => edit(x.id, { caption: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-fg"><input type="checkbox" className="h-5 w-5" checked={!!x.hidden} onChange={(e) => edit(x.id, { hidden: e.target.checked })} /> Hide</label>
            <button className={btn} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
            <button className={btn} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
            <button className={btn} onClick={() => del(x)}>Delete</button>
            <button className="border-em rounded-full border px-4 py-2 text-sm text-em" onClick={() => save(x)}>Save</button>
          </div>
        ))}
      </div>
      <SaveBar dirty={S.dirty} msg={S.msg} onSave={S.save} onUndo={S.undo} onRedo={S.redo} canUndo={S.canUndo} canRedo={S.canRedo} />
    </div>
  );
}

export default function Page() { return <Gate><Manager /></Gate>; }
