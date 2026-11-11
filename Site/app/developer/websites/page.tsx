"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, Site } from "@/lib/supabase";
import Gate from "@/components/Gate";
import { Tips } from "@/components/Tour";
import { CaptureButton } from "@/components/CaptureButton";

const inp = "w-full rounded-lg border bd-gold-30 bg-field p-2.5 text-base sm:text-sm";
const btn = "rounded-full border border-gold px-4 py-2 text-sm text-gold";

function Manager() {
  const [sites, setSites] = useState<Site[]>([]);
  const [msg, setMsg] = useState("");
  const load = async () => {
    const { data } = await supabase.from("sites").select("*").order("sort");
    setSites((data as Site[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const edit = (id: string, p: Partial<Site>) => setSites((s) => s.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const save = async (x: Site) => {
    const { id, ...rest } = x;
    const { error } = await supabase.from("sites").update(rest).eq("id", id);
    setMsg(error ? error.message : `Saved ${x.name}`);
  };
  const add = async () => { await supabase.from("sites").insert({ name: "New website", url: "https://", sort: sites.length }); load(); };
  const del = async (id: string) => { if (confirm("Delete this website?")) { await supabase.from("sites").delete().eq("id", id); load(); } };
  const move = async (i: number, d: number) => {
    const a = [...sites]; if (!a[i + d]) return;
    [a[i], a[i + d]] = [a[i + d], a[i]];
    await Promise.all(a.map((x, k) => supabase.from("sites").update({ sort: k }).eq("id", x.id)));
    load();
  };
  const upload = async (x: Site, f: File) => {
    const path = `${x.id}-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("screenshots").upload(path, f, { upsert: true });
    if (error) return setMsg(error.message);
    edit(x.id, { screenshot_url: supabase.storage.from("screenshots").getPublicUrl(path).data.publicUrl });
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-bg p-5 text-fg">
      <h1 className="font-serif text-3xl text-gold">Developer Space · Websites</h1>
      <div className="mt-3"><Tips id="websites" items={["New websites start hidden: fill the link, untick Hide, then press Save on that row.", "Capture screenshot takes a picture of the live site; Upload screenshot uses your own image.", "Use ↑ and ↓ to change the order of the cards."]} /></div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-em"><Link href="/developer/settings">Site Settings →</Link><Link href="/developer/gallery">Gallery Manager →</Link><Link href="/developer/blog">Blog Manager →</Link><Link href="/developer/moodboard">Mood-board Manager →</Link></div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
      {sites.map((x, i) => (
        <div key={x.id} className="grid content-start gap-2 rounded-xl border bd-gold-25 p-3">
          <input className={inp} value={x.name} onChange={(e) => edit(x.id, { name: e.target.value })} placeholder="Name" />
          <input className={inp} value={x.url} onChange={(e) => edit(x.id, { url: e.target.value })} placeholder="https://..." />
          <textarea className={inp} value={x.description} onChange={(e) => edit(x.id, { description: e.target.value })} placeholder="Description" />
          <input className={inp} value={x.tags.join(", ")} onChange={(e) => edit(x.id, { tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} placeholder="Tags, comma separated" />
          {x.screenshot_url && <img src={x.screenshot_url} alt="" className="h-24 rounded-lg object-cover" />}
          <div className="flex flex-wrap items-center gap-2.5 text-base sm:text-sm">
            <CaptureButton id={x.id} url={x.url} onDone={(u) => edit(x.id, { screenshot_url: u })} />
            <label className={btn}>Upload screenshot<input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(x, e.target.files[0])} /></label>
            <label><input type="checkbox" checked={x.live_preview} onChange={(e) => edit(x.id, { live_preview: e.target.checked })} /> Live preview</label>
            <label><input type="checkbox" checked={x.hidden} onChange={(e) => edit(x.id, { hidden: e.target.checked })} /> Hide</label>
            <button className={btn} onClick={() => move(i, -1)}>↑</button>
            <button className={btn} onClick={() => move(i, 1)}>↓</button>
            <button className={btn} onClick={() => del(x.id)}>Delete</button>
            <button className="rounded-full border border-em px-3 py-1 text-em" onClick={() => save(x)}>Save</button>
          </div>
        </div>
      ))}
      </div>
      <button className={btn} onClick={add}>+ Add website</button>
      <p className="mt-3 text-em">{msg}</p>
    </main>
  );
}

export default function Page() { return <Gate><Manager /></Gate>; }
