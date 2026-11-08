"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";

type Row = { id: string; caption: string; image_path: string; sort: number };
const inp = "rounded-lg border bd-gold-30 bg-field p-2.5 text-base sm:text-sm";
const btn = "rounded-full border border-gold px-4 py-2 text-sm text-gold";

function Manager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");
  const load = async () => {
    const { data } = await supabase.from("moods").select("id,caption,image_path,sort").order("sort");
    setRows((data as Row[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const url = (p: string) => supabase.storage.from("gallery").getPublicUrl(p).data.publicUrl;
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
  const save = async (x: Row) => {
    const { error } = await supabase.from("moods").update({ caption: x.caption }).eq("id", x.id);
    setMsg(error ? error.message : "Saved");
  };
  const del = async (x: Row) => {
    if (!confirm("Delete this photo?")) return;
    await supabase.storage.from("gallery").remove([x.image_path]);
    await supabase.from("moods").delete().eq("id", x.id);
    load();
  };
  const move = async (i: number, d: number) => {
    const a = [...rows]; if (!a[i + d]) return;
    [a[i], a[i + d]] = [a[i + d], a[i]];
    await Promise.all(a.map((x, k) => supabase.from("moods").update({ sort: k }).eq("id", x.id)));
    load();
  };

  return (
    <main className="w-full">
      <h1 className="font-serif text-3xl text-gold">Developer Space · Mood-board Manager</h1>
      <Link href="/developer" className="text-sm text-em">← Websites Manager</Link>
      <label className={`${btn} my-4 inline-block cursor-pointer`}>Upload photos<input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} /></label>
      <div className="grid gap-3 xl:grid-cols-2">
      {rows.map((x, i) => (
        <div key={x.id} className="flex flex-wrap items-center gap-2 rounded-xl border bd-gold-25 p-2">
          <img src={url(x.image_path)} alt="" className="h-14 w-20 rounded-lg object-cover" />
          <input className={`${inp} min-w-[140px] flex-1`} value={x.caption} placeholder="Caption (optional)" onChange={(e) => setRows((r) => r.map((y) => (y.id === x.id ? { ...y, caption: e.target.value } : y)))} />
          <button className={btn} onClick={() => move(i, -1)}>↑</button>
          <button className={btn} onClick={() => move(i, 1)}>↓</button>
          <button className={btn} onClick={() => del(x)}>Delete</button>
          <button className="rounded-full border border-em px-4 py-2 text-sm text-em" onClick={() => save(x)}>Save</button>
        </div>
      ))}
      </div>
      <p className="mt-3 text-em">{msg}</p>
    </main>
  );
}

export default function Page() { return <Gate><Manager /></Gate>; }
