"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import SaveBar from "@/components/SaveBar";
import PreviewPane from "@/components/PreviewPane";
import AiHelper from "@/components/AiHelper";
import TemplatePicker from "@/components/TemplatePicker";
import { Tips } from "@/components/Tour";
import { useSettings } from "@/hooks/useSettings";
import { useDnD } from "@/hooks/useDnD";
import type { AboutBlock, Settings } from "@/lib/settings";

const inp = "w-full rounded-lg border bd-gold-30 bg-field p-2.5 text-base text-fg sm:text-sm";
const btn = "bd-gold-40 rounded-full border px-3 py-2 text-sm text-gold";
type F = { k: keyof Settings; label: string; kind?: "text" | "area" | "big" | "check"; hint?: "len" };
const GROUPS: { title: string; fields: F[] }[] = [
  { title: "Home page text", fields: [
    { k: "site_name", label: "Website name (the big title)" },
    { k: "tagline", label: "Tagline above the title" },
    { k: "hero_intro", label: "Intro text under the title", kind: "area" },
    { k: "footer_text", label: "Footer text" },
  ]},
  { title: "Tamil versions (shown when a visitor taps தமிழ்)", fields: [
    { k: "tagline_ta", label: "Tagline in Tamil" },
    { k: "hero_intro_ta", label: "Intro text in Tamil", kind: "area" },
    { k: "footer_text_ta", label: "Footer text in Tamil (empty = same as English)" },
    { k: "about_title_ta", label: "About page title in Tamil" },
    { k: "about_body_ta", label: "Simple About text in Tamil (used when you have no About blocks below)", kind: "big" },
    { k: "contact_intro_ta", label: "Contact page intro in Tamil", kind: "area" },
  ]},
  { title: "Contact and WhatsApp", fields: [
    { k: "whatsapp_number", label: "WhatsApp number with country code, digits only, for example 919876543210. Empty = no WhatsApp button." },
    { k: "whatsapp_message", label: "First message visitors send you on WhatsApp", kind: "area" },
    { k: "show_whatsapp_float", label: "Show the round WhatsApp button on every page", kind: "check" },
    { k: "contact_intro", label: "Contact page intro in English (empty = default text)", kind: "area" },
  ]},
  { title: "Google, Bing, analytics and AI search", fields: [
    { k: "owner_name", label: "Your full name (the name people search)" },
    { k: "also_known_as", label: "Other spellings people search, separated by commas" },
    { k: "job_title", label: "Your profession" },
    { k: "seo_title", label: "Home page Google title (about 60 characters)", hint: "len" },
    { k: "seo_description", label: "Home page Google description (about 155 characters)", kind: "area", hint: "len" },
    { k: "seo_keywords", label: "Keywords, separated by commas", kind: "area" },
    { k: "same_as", label: "Your other official websites and profiles (one per line)", kind: "area" },
    { k: "google_verification", label: "Google Search Console code (only the code after content=)" },
    { k: "bing_verification", label: "Bing Webmaster code (only the code)" },
    { k: "ga_id", label: "Google Analytics measurement ID, like G-ABC123XYZ (empty = no analytics)" },
    { k: "robots_index", label: "Let search engines list this website (untick to hide it everywhere)", kind: "check" },
  ]},
];
const PAGES: [string, string][] = [["/about", "About page"], ["/gallery", "Gallery page"], ["/moodboard", "Mood-board page"], ["/blog", "Blog page"], ["/contact", "Contact page"]];
const TYPES: [AboutBlock["type"], string][] = [["heading", "Heading"], ["text", "Paragraph"], ["list", "Bullet list (one per line)"], ["quote", "Quote"], ["divider", "Divider line"]];

function Editor() {
  const { v, set, patch, save, undo, redo, canUndo, canRedo, dirty, msg, savedAt } = useSettings();
  const [note, setNote] = useState("");
  const blocks = v.about_blocks;
  const dnd = useDnD(blocks, (n) => set("about_blocks", n));
  const edit = (i: number, p: Partial<AboutBlock>) => set("about_blocks", blocks.map((b, k) => (k === i ? { ...b, ...p } : b)));
  const move = (i: number, d: number) => { const a = [...blocks]; if (!a[i + d]) return; [a[i], a[i + d]] = [a[i + d], a[i]]; set("about_blocks", a); };
  const seo = (path: string, key: "title" | "description", val: string) => set("page_seo", { ...v.page_seo, [path]: { title: v.page_seo[path]?.title ?? "", description: v.page_seo[path]?.description ?? "", [key]: val } });
  const ping = async () => {
    setNote("Sending…");
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/indexnow", { method: "POST", headers: { Authorization: `Bearer ${data.session?.access_token}` } });
    const j = await r.json().catch(() => ({}));
    setNote(r.ok ? `Sent ${j.count} pages to Bing and other IndexNow search engines (status ${j.status}).` : j.error || "Failed");
  };
  const Box = ({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) => (
    <section className={`bd-gold-25 grid content-start gap-3 rounded-xl border p-4 ${wide ? "2xl:col-span-2" : ""}`}><h2 className="font-serif text-2xl text-gold">{title}</h2>{children}</section>
  );
  return (
    <div>
      <h1 className="font-serif text-3xl text-gold">Site Settings &amp; SEO</h1>
      <p className="mt-1 text-sm text-muted">Texts, About page, search details and extras. For colours, fonts, layout and the intro use <Link href="/developer/design" className="text-em underline">Design &amp; Layout</Link>.</p>
      <div className="mt-4"><Tips id="settings" items={["Quick look below: one tap applies a full template (colours, fonts, shapes). Fine-tune it in Design & Layout.", "The About page builder lets you add headings, paragraphs, lists and quotes in English and Tamil, and drag them into order.", "Search details per page let you write the Google title and description of each page.", "Use “Notify search engines now” after big changes. Text changes show in the preview after you press Save."]} /></div>
      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="grid content-start gap-5 2xl:grid-cols-2">
          <Box title="Quick look (templates)" wide><TemplatePicker onApply={patch} /></Box>
          {GROUPS.map((g, gi) => (
            <Box key={g.title} title={g.title} wide={gi === 3}>
              {g.fields.map((f) => (
                <label key={f.k} className="grid gap-1 text-sm text-muted">
                  <span>{f.label}{f.hint === "len" && <span className="text-xs"> ({String(v[f.k] ?? "").length} characters)</span>}</span>
                  {f.kind === "check" ? (
                    <input type="checkbox" className="h-5 w-5" checked={!!v[f.k]} onChange={(e) => set(f.k, e.target.checked as never)} />
                  ) : f.kind === "area" || f.kind === "big" ? (
                    <textarea className={`${inp} ${f.kind === "big" ? "min-h-[200px]" : "min-h-[84px]"}`} value={String(v[f.k] ?? "")} onChange={(e) => set(f.k, e.target.value as never)} />
                  ) : (
                    <input className={inp} value={String(v[f.k] ?? "")} onChange={(e) => set(f.k, e.target.value as never)} autoCapitalize="none" spellCheck={false} />
                  )}
                </label>
              ))}
            </Box>
          ))}

          <Box title="About page builder" wide>
            <label className="grid gap-1 text-sm text-muted"><span>Page title</span><input className={inp} value={v.about_title} onChange={(e) => set("about_title", e.target.value)} /></label>
            <label className="grid gap-1 text-sm text-muted"><span>Look of the page</span>
              <select className={inp} value={v.about_layout} onChange={(e) => set("about_layout", e.target.value as Settings["about_layout"])}>
                <option value="simple">Simple</option><option value="card">Text inside a card</option><option value="columns">Two columns (wide)</option>
              </select>
            </label>
            <p className="text-xs text-muted">Add blocks below. With no blocks, the page shows the simple About text instead.</p>
            <div className="grid gap-3">
              {blocks.map((b, i) => (
                <div key={i} {...dnd(i)} className="bd-gold-25 grid gap-2 rounded-lg border bg-card p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span aria-hidden className="text-muted">⠿</span>
                    <select className={`${inp} !w-auto`} value={b.type} onChange={(e) => edit(i, { type: e.target.value as AboutBlock["type"] })}>{TYPES.map(([t, l]) => <option key={t} value={t}>{l}</option>)}</select>
                    <span className="flex-1" />
                    <button className={btn} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                    <button className={btn} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                    <button className={btn} onClick={() => set("about_blocks", blocks.filter((_, k) => k !== i))} aria-label="Remove">✕</button>
                  </div>
                  {b.type !== "divider" && (
                    <>
                      <textarea className={`${inp} min-h-[70px]`} placeholder="English" value={b.en} onChange={(e) => edit(i, { en: e.target.value })} />
                      <textarea className={`${inp} min-h-[70px]`} placeholder="தமிழ் (optional)" value={b.ta} onChange={(e) => edit(i, { ta: e.target.value })} />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">{TYPES.map(([t, l]) => <button key={t} className={btn} onClick={() => set("about_blocks", [...blocks, { type: t, en: "", ta: "" }])}>+ {l}</button>)}</div>
          </Box>

          <Box title="Search details per page" wide>
            <p className="text-xs text-muted">What Google shows for each page. Empty = the page’s normal title and description.</p>
            {PAGES.map(([path, label]) => (
              <div key={path} className="bd-gold-25 grid gap-2 rounded-lg border bg-card p-3">
                <p className="font-serif text-lg text-gold">{label} <span className="text-xs text-muted">{path}</span></p>
                <input className={inp} placeholder="Google title" value={v.page_seo[path]?.title ?? ""} onChange={(e) => seo(path, "title", e.target.value)} />
                <textarea className={`${inp} min-h-[64px]`} placeholder="Google description" value={v.page_seo[path]?.description ?? ""} onChange={(e) => seo(path, "description", e.target.value)} />
              </div>
            ))}
          </Box>

          <Box title="Tell search engines" wide>
            <p className="text-sm text-muted">Sends your public pages to Bing and other IndexNow search engines. Status 200 or 202 means accepted. Google does not use this: for Google, use Search Console.</p>
            <button className={`${btn} w-fit !px-5 !py-3`} onClick={ping}>Notify search engines now</button>
            <p className="text-em">{note}</p>
          </Box>
        </div>
        <aside className="grid content-start gap-5">
          <PreviewPane v={v} savedAt={savedAt} />
          <AiHelper values={v} onApply={patch} />
        </aside>
      </div>
      <SaveBar dirty={dirty} msg={msg} onSave={save} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
    </div>
  );
}

export default function Page() { return <Gate><Editor /></Gate>; }
