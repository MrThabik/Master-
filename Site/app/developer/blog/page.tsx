"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import { Tips } from "@/components/Tour";

type Post = { id: string; slug: string; title: string; lang: string; topic: string; body: string; published: boolean };
const inp = "w-full rounded-lg border bd-gold-30 bg-field p-2.5 text-base sm:text-sm";
const btn = "rounded-full border border-gold px-4 py-2 text-sm text-gold";

function Manager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [msg, setMsg] = useState("");
  const load = async () => {
    const { data } = await supabase.from("posts").select("id,slug,title,lang,topic,body,published").order("created_at", { ascending: false });
    setPosts((data as Post[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const edit = (id: string, p: Partial<Post>) => setPosts((s) => s.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const add = async () => {
    const { error } = await supabase.from("posts").insert({ slug: "post-" + Date.now().toString(36), title: "New post" });
    setMsg(error ? error.message : "Created");
    load();
  };
  const save = async (x: Post) => {
    const { id, ...rest } = x;
    const { error } = await supabase.from("posts").update(rest).eq("id", id);
    setMsg(error ? error.message : `Saved ${x.title}`);
  };
  const del = async (id: string) => { if (confirm("Delete this post?")) { await supabase.from("posts").delete().eq("id", id); load(); } };

  return (
    <main className="w-full">
      <h1 className="font-serif text-3xl text-gold">Developer Space · Blog Manager</h1>
      <div className="mt-3"><Tips id="blog" items={["Tick Published for a post to appear. Unpublished posts stay hidden drafts.", "A blank line starts a new paragraph. Write in Tamil or English and set the Language.", "Subscribers can be emailed from the Subscribers page when you publish."]} /></div>
      <Link href="/developer" className="text-sm text-em">← Dashboard</Link>
      <div className="my-4"><button className={btn} onClick={add}>+ New post</button></div>
      <div className="grid gap-4 xl:grid-cols-2">
      {posts.map((x) => (
        <div key={x.id} className="grid content-start gap-2 rounded-xl border bd-gold-25 p-3">
          <input className={inp} value={x.title} onChange={(e) => edit(x.id, { title: e.target.value })} placeholder="Title" />
          <div className="flex flex-wrap gap-2">
            <input className={`${inp} flex-1`} value={x.slug} onChange={(e) => edit(x.id, { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="url-slug" />
            <select className={inp + " w-auto"} value={x.lang} onChange={(e) => edit(x.id, { lang: e.target.value })}><option>English</option><option>Tamil</option></select>
            <input className={`${inp} flex-1`} value={x.topic} onChange={(e) => edit(x.id, { topic: e.target.value })} placeholder="Topic" />
          </div>
          <textarea className={`${inp} min-h-[160px]`} value={x.body} onChange={(e) => edit(x.id, { body: e.target.value })} placeholder="Write your post. Leave a blank line between paragraphs." />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label><input type="checkbox" checked={x.published} onChange={(e) => edit(x.id, { published: e.target.checked })} /> Published</label>
            <button className={btn} onClick={() => del(x.id)}>Delete</button>
            <button className="rounded-full border border-em px-3 py-1 text-em" onClick={() => save(x)}>Save</button>
          </div>
        </div>
      ))}
      </div>
      <p className="text-em">{msg}</p>
    </main>
  );
}

export default function Page() { return <Gate><Manager /></Gate>; }
