"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import SaveBar from "@/components/SaveBar";
import { Tips } from "@/components/Tour";
import { useSettings } from "@/hooks/useSettings";
import { Md, readingMinutes } from "@/lib/md";
import type { Settings } from "@/lib/settings";

type Post = { id: string; slug: string; title: string; lang: string; topic: string; body: string; published: boolean; excerpt: string | null; cover_path: string | null; tags: string | null; featured: boolean };
const inp = "rounded-lg border bd-gold-30 bg-field p-2.5 text-base text-fg sm:text-sm";
const btn = "bd-gold-40 rounded-full border px-3 py-2 text-sm text-gold";
const cover = (p: string) => supabase.storage.from("gallery").getPublicUrl(p).data.publicUrl;
const sqlHint = (m: string) => (/column|schema cache/i.test(m) ? "Run the Update 6 SQL in Supabase first (adds excerpt, cover, tags and featured), then try again." : m);
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

function Manager() {
  const S = useSettings();
  const { v, set } = S;
  const [posts, setPosts] = useState<Post[]>([]);
  const [msg, setMsg] = useState("");
  const [prev, setPrev] = useState<string[]>([]);
  const load = async () => { const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false }); setPosts((data as Post[]) ?? []); };
  useEffect(() => { load(); }, []);

  const edit = (id: string, p: Partial<Post>) => setPosts((s) => s.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const add = async () => {
    const { error } = await supabase.from("posts").insert({ slug: "post-" + Date.now().toString(36), title: "New post" });
    setMsg(error ? error.message : "Created");
    load();
  };
  const save = async (x: Post) => {
    const { id, ...rest } = x;
    const { error } = await supabase.from("posts").update({ ...rest, excerpt: rest.excerpt || null, tags: rest.tags || null }).eq("id", id);
    setMsg(error ? sqlHint(error.message) : `Saved ${x.title}`);
  };
  const del = async (x: Post) => { if (!confirm("Delete this post?")) return; await supabase.from("posts").delete().eq("id", x.id); load(); };
  const upload = async (x: Post, f: File) => {
    const path = `blog/${crypto.randomUUID()}-${f.name.replace(/[^\w.-]/g, "_")}`;
    const up = await supabase.storage.from("gallery").upload(path, f);
    if (up.error) { setMsg(up.error.message); return; }
    edit(x.id, { cover_path: path });
    setMsg("Cover uploaded. Press Save on the post.");
  };
  // markdown toolbar: wraps the selected text of the post body
  const wrap = (x: Post, before: string, after = "", fallback = "text") => {
    const el = document.getElementById(`body-${x.id}`) as HTMLTextAreaElement | null;
    const a = el?.selectionStart ?? x.body.length, b = el?.selectionEnd ?? x.body.length;
    const mid = x.body.slice(a, b) || fallback;
    edit(x.id, { body: x.body.slice(0, a) + before + mid + after + x.body.slice(b) });
    setTimeout(() => { el?.focus(); el?.setSelectionRange(a + before.length, a + before.length + mid.length); }, 0);
  };
  const L = <K extends keyof Settings>(k: K) => (e: { target: { value: string } }) => set(k, e.target.value as Settings[K]);
  const Ln = <K extends keyof Settings>(k: K) => (e: { target: { value: string } }) => set(k, Number(e.target.value) as Settings[K]);
  const Lc = <K extends keyof Settings>(k: K) => (e: { target: { checked: boolean } }) => set(k, e.target.checked as Settings[K]);
  const chk = "flex items-center gap-3 text-sm text-fg";

  return (
    <div>
      <h1 className="font-serif text-3xl text-gold">Blog Manager</h1>
      <div className="mt-3"><Tips id="blog" items={["Blog look: layout, columns, post template, text size and width, then press Save changes at the bottom.", "Write with the toolbar: B bold, I italic, H heading, link, list, quote and image. A blank line starts a new paragraph.", "Add a cover picture and a short excerpt: they show on the blog list and when the post is shared.", "Tick Published for a post to appear; Featured posts show first. Preview shows how the post will read."]} /></div>

      <section className="bd-gold-25 mt-4 grid gap-3 rounded-xl border p-4 md:grid-cols-2 xl:grid-cols-3">
        <h2 className="font-serif text-2xl text-gold md:col-span-2 xl:col-span-3">Blog look</h2>
        <label className="grid gap-1 text-sm text-muted">Blog title<input className={inp} value={v.blog_title} onChange={L("blog_title")} /></label>
        <label className="grid gap-1 text-sm text-muted md:col-span-2">Intro text (optional)<input className={inp} value={v.blog_intro} onChange={L("blog_intro")} /></label>
        <label className="grid gap-1 text-sm text-muted">List layout<select className={inp} value={v.blog_layout} onChange={L("blog_layout")}><option value="cards">Cards</option><option value="list">Simple list</option><option value="magazine">Magazine (first post large)</option></select></label>
        <label className="grid gap-1 text-sm text-muted">Columns<select className={inp} value={v.blog_columns} onChange={Ln("blog_columns")}><option value={1}>1</option><option value={2}>2</option></select></label>
        <label className="grid gap-1 text-sm text-muted">Post template<select className={inp} value={v.post_template} onChange={L("post_template")}><option value="classic">Classic</option><option value="centered">Centered</option><option value="editorial">Editorial (big title, drop cap)</option></select></label>
        <label className="grid gap-1 text-sm text-muted">Post width<select className={inp} value={v.post_width} onChange={L("post_width")}><option value="narrow">Narrow</option><option value="normal">Normal</option><option value="wide">Wide</option></select></label>
        <label className="grid gap-1 text-sm text-muted">Post text size: {v.post_size}px<input type="range" min={15} max={24} value={v.post_size} onChange={Ln("post_size")} className="h-8" /></label>
        <div className="grid gap-2">
          <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.blog_show_meta} onChange={Lc("blog_show_meta")} /> Show topic and date on the list</label>
          <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.blog_show_excerpt} onChange={Lc("blog_show_excerpt")} /> Show the excerpt on the list</label>
          <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.post_show_time} onChange={Lc("post_show_time")} /> Show reading time</label>
          <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.post_show_share} onChange={Lc("post_show_share")} /> Show share buttons</label>
          <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.post_show_subscribe} onChange={Lc("post_show_subscribe")} /> Show the subscribe box</label>
        </div>
      </section>

      <div className="my-4 flex flex-wrap items-center gap-3"><button className={btn} onClick={add}>+ New post</button><span className="text-sm text-em">{msg}</span></div>
      <div className="grid gap-4 xl:grid-cols-2">
        {posts.map((x) => (
          <div key={x.id} className="bd-gold-25 grid content-start gap-2 rounded-xl border p-3">
            <input className={`${inp} w-full`} value={x.title} onChange={(e) => edit(x.id, { title: e.target.value, ...(x.slug.startsWith("post-") ? { slug: slugify(e.target.value) || x.slug } : {}) })} placeholder="Title" />
            <div className="flex flex-wrap gap-2">
              <input className={`${inp} min-w-[140px] flex-1`} value={x.slug} onChange={(e) => edit(x.id, { slug: slugify(e.target.value) })} placeholder="url-name" />
              <select className={inp} value={x.lang} onChange={(e) => edit(x.id, { lang: e.target.value })}><option>English</option><option>Tamil</option></select>
              <input className={`${inp} min-w-[120px] flex-1`} value={x.topic} onChange={(e) => edit(x.id, { topic: e.target.value })} placeholder="Topic" />
            </div>
            <input className={`${inp} w-full`} value={x.tags ?? ""} onChange={(e) => edit(x.id, { tags: e.target.value })} placeholder="Tags, separated by commas" />
            <textarea className={`${inp} min-h-[60px] w-full`} value={x.excerpt ?? ""} onChange={(e) => edit(x.id, { excerpt: e.target.value })} placeholder="Short excerpt for the list and for sharing (optional)" />
            <div className="flex flex-wrap items-center gap-2">
              {x.cover_path && /* eslint-disable-next-line @next/next/no-img-element */ <img src={cover(x.cover_path)} alt="" className="h-14 w-24 rounded-lg object-cover" />}
              <label className={`${btn} cursor-pointer`}>{x.cover_path ? "Change cover" : "Add cover picture"}<input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(x, e.target.files[0])} /></label>
              {x.cover_path && <button className={btn} onClick={() => edit(x.id, { cover_path: null })}>Remove cover</button>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className={btn} onClick={() => wrap(x, "**", "**", "bold")}><b>B</b></button>
              <button className={btn} onClick={() => wrap(x, "*", "*", "italic")}><i>I</i></button>
              <button className={btn} onClick={() => wrap(x, "\n\n## ", "\n\n", "Heading")}>H</button>
              <button className={btn} onClick={() => wrap(x, "[", "](https://)", "link text")}>Link</button>
              <button className={btn} onClick={() => wrap(x, "\n\n- ", "\n- \n- ", "item")}>List</button>
              <button className={btn} onClick={() => wrap(x, "\n\n> ", "\n\n", "quote")}>Quote</button>
              <button className={btn} onClick={() => wrap(x, "\n\n![", "](https://)\n\n", "describe the picture")}>Image</button>
            </div>
            <textarea id={`body-${x.id}`} className={`${inp} min-h-[200px] w-full`} value={x.body} onChange={(e) => edit(x.id, { body: e.target.value })} placeholder="Write your post. A blank line starts a new paragraph." />
            <p className="text-xs text-muted">{x.body.trim() ? x.body.trim().split(/\s+/).length : 0} words · about {readingMinutes(x.body)} min to read</p>
            {prev.includes(x.id) && <div className="bd-gold-25 rounded-lg border bg-card p-4 leading-7"><Md text={x.body} /></div>}
            <div className="flex flex-wrap items-center gap-3">
              <label className={chk}><input type="checkbox" className="h-5 w-5" checked={x.published} onChange={(e) => edit(x.id, { published: e.target.checked })} /> Published</label>
              <label className={chk}><input type="checkbox" className="h-5 w-5" checked={!!x.featured} onChange={(e) => edit(x.id, { featured: e.target.checked })} /> Featured</label>
              <button className={btn} onClick={() => setPrev((p) => (p.includes(x.id) ? p.filter((i) => i !== x.id) : [...p, x.id]))}>{prev.includes(x.id) ? "Hide preview" : "Preview"}</button>
              <button className={btn} onClick={() => del(x)}>Delete</button>
              <button className="border-em rounded-full border px-4 py-2 text-sm text-em" onClick={() => save(x)}>Save post</button>
            </div>
          </div>
        ))}
      </div>
      <SaveBar dirty={S.dirty} msg={S.msg} onSave={S.save} onUndo={S.undo} onRedo={S.redo} canUndo={S.canUndo} canRedo={S.canRedo} />
    </div>
  );
}

export default function Page() { return <Gate><Manager /></Gate>; }
