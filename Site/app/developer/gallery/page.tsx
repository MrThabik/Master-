"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import { Tips } from "@/components/Tour";

type Row = { id: string; title: string; album: string; image_path: string; sort: number; width: number | null; height: number | null; fit: string; position: string };
const ALBUMS = ["Photography", "Digital Art", "Drawings & Paintings"];
const inp = "rounded-lg border bd-gold-30 bg-field p-2.5 text-base sm:text-sm";
const btn = "rounded-full border border-gold px-4 py-2 text-sm text-gold";

const publicUrl = (p: string) => supabase.storage.from("gallery").getPublicUrl(p).data.publicUrl;
const measure = (src: string) =>
  new Promise<{ w: number; h: number }>((res) => {
    const i = new Image();
    i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight });
    i.onerror = () => res({ w: 0, h: 0 });
    i.src = src;
  });
const shape = (r: Row) => (!r.width || !r.height ? "Unknown shape" : r.width / r.height > 1.05 ? "Landscape" : r.width / r.height < 0.95 ? "Portrait" : "Square");

function Manager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");
  const load = async () => {
    const { data } = await supabase.from("artworks").select("id,title,album,image_path,sort,width,height,fit,position").order("sort");
    const list = (data as Row[]) ?? [];
    setRows(list);
    // older photos without a saved size: measure them once
    for (const r of list.filter((x) => !x.width)) {
      const m = await measure(publicUrl(r.image_path));
      if (m.w) {
        await supabase.from("artworks").update({ width: m.w, height: m.h }).eq("id", r.id);
        setRows((cur) => cur.map((x) => (x.id === r.id ? { ...x, width: m.w, height: m.h } : x)));
      }
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
      await supabase.from("artworks").insert({ title: f.name.replace(/\.[^.]+$/, ""), album: ALBUMS[0], image_path: path, sort: n++, width: m.w || null, height: m.h || null });
    }
    setMsg("Uploaded. Landscape and portrait photos are both supported.");
    load();
  };
  const save = async (x: Row) => {
    const { error } = await supabase.from("artworks").update({ title: x.title, album: x.album, fit: x.fit, position: x.position }).eq("id", x.id);
    setMsg(error ? error.message : `Saved ${x.title}`);
  };
  const del = async (x: Row) => {
    if (!confirm("Delete this artwork?")) return;
    await supabase.storage.from("gallery").remove([x.image_path]);
    await supabase.from("artworks").delete().eq("id", x.id);
    load();
  };
  const move = async (i: number, d: number) => {
    const a = [...rows]; if (!a[i + d]) return;
    [a[i], a[i + d]] = [a[i + d], a[i]];
    await Promise.all(a.map((x, k) => supabase.from("artworks").update({ sort: k }).eq("id", x.id)));
    load();
  };

  return (
    <main className="w-full">
      <h1 className="font-serif text-3xl text-gold">Developer Space · Gallery Manager</h1>
      <div className="mt-3"><Tips id="gallery" items={["Upload many photos at once; each one is measured so tall and wide photos both look right.", "Size: Auto is best. Show whole photo never crops; Fill screen crops to fill. Focus chooses what stays visible.", "Press Save on each photo after changing its title, album or size."]} /></div>
      <Link href="/developer" className="text-sm text-em">← Dashboard</Link>
      <p className="mt-3 text-sm text-muted">For each photo choose how it fills the screen: <b>Auto</b> (recommended) shows tall photos whole on a wide screen, <b>Show whole photo</b> never crops, <b>Fill screen</b> crops to fill, and <b>Focus</b> decides which part stays visible when it is cropped.</p>
      <label className={`${btn} my-4 inline-block cursor-pointer`}>Upload images<input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} /></label>
      <div className="grid gap-4 md:grid-cols-2">
      {rows.map((x, i) => (
        <div key={x.id} className="grid content-start gap-2 rounded-xl border bd-gold-25 p-3">
          <div className="flex items-center gap-3">
            <img src={publicUrl(x.image_path)} alt="" className="h-20 w-20 rounded-lg object-cover" />
            <div className="text-sm text-muted">{shape(x)}{x.width ? ` · ${x.width}×${x.height}` : ""}</div>
          </div>
          <input className={`${inp} w-full`} value={x.title} onChange={(e) => edit(x.id, { title: e.target.value })} />
          <div className="flex flex-wrap gap-2">
            <select className={inp} value={x.album} onChange={(e) => edit(x.id, { album: e.target.value })}>{ALBUMS.map((a) => <option key={a}>{a}</option>)}</select>
            <select className={inp} value={x.fit} onChange={(e) => edit(x.id, { fit: e.target.value })}>
              <option value="auto">Size: Auto</option><option value="whole">Size: Show whole photo</option><option value="fill">Size: Fill screen</option>
            </select>
            <select className={inp} value={x.position} onChange={(e) => edit(x.id, { position: e.target.value })}>
              <option value="top">Focus: Top</option><option value="center">Focus: Center</option><option value="bottom">Focus: Bottom</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={btn} onClick={() => move(i, -1)}>↑</button>
            <button className={btn} onClick={() => move(i, 1)}>↓</button>
            <button className={btn} onClick={() => del(x)}>Delete</button>
            <button className="rounded-full border border-em px-4 py-2 text-sm text-em" onClick={() => save(x)}>Save</button>
          </div>
        </div>
      ))}
      </div>
      <p className="mt-3 text-em">{msg}</p>
    </main>
  );
}

export default function Page() { return <Gate><Manager /></Gate>; }
