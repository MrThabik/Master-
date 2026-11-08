"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import SaveBar from "@/components/SaveBar";
import { useSettings } from "@/hooks/useSettings";
import type { Settings } from "@/lib/settings";

const inp = "w-full rounded-lg border bd-gold-30 bg-field p-2.5 text-base text-fg sm:text-sm";
type F = { k: keyof Settings; label: string; kind?: "text" | "area" | "big"; hint?: "len" | "code" };
const GROUPS: { title: string; fields: F[] }[] = [
  { title: "Home page text", fields: [
    { k: "site_name", label: "Website name (the big title)" },
    { k: "tagline", label: "Tagline above the title" },
    { k: "hero_intro", label: "Intro text under the title", kind: "area" },
    { k: "footer_text", label: "Footer text" },
  ]},
  { title: "About page", fields: [
    { k: "about_title", label: "About page title" },
    { k: "about_body", label: "About text (a blank line starts a new paragraph)", kind: "big" },
  ]},
  { title: "Google, meta and AI search", fields: [
    { k: "owner_name", label: "Your full name (the name people search)" },
    { k: "also_known_as", label: "Other spellings people search, separated by commas" },
    { k: "job_title", label: "Your profession" },
    { k: "seo_title", label: "Google title (about 60 characters)", hint: "len" },
    { k: "seo_description", label: "Google description (about 155 characters)", kind: "area", hint: "len" },
    { k: "seo_keywords", label: "Keywords, separated by commas", kind: "area" },
    { k: "same_as", label: "Your other official websites and profiles (one per line)", kind: "area" },
    { k: "google_verification", label: "Google Search Console code (only the code after content=, without google-site-verification=)", hint: "code" },
  ]},
];

function Editor() {
  const { v, set, save, dirty, msg } = useSettings();
  const [note, setNote] = useState("");
  const ping = async () => {
    setNote("Sending…");
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/indexnow", { method: "POST", headers: { Authorization: `Bearer ${data.session?.access_token}` } });
    const j = await r.json().catch(() => ({}));
    setNote(r.ok ? `Sent ${j.count} pages to Bing and other IndexNow search engines (status ${j.status}).` : j.error || "Failed");
  };
  return (
    <div>
      <h1 className="font-serif text-3xl text-gold">Site Settings &amp; SEO</h1>
      <p className="mt-1 text-sm text-muted">Texts and search details. For colours, fonts, layout, intro and navigation use <Link href="/developer/design" className="text-em underline">Design &amp; Layout</Link>.</p>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {GROUPS.map((g, gi) => (
          <section key={g.title} className={`bd-gold-25 grid content-start gap-3 rounded-xl border p-4 ${gi === 2 ? "xl:col-span-2" : ""}`}>
            <h2 className="font-serif text-2xl text-gold">{g.title}</h2>
            {g.fields.map((f) => (
              <label key={f.k} className="grid gap-1 text-sm text-muted">
                <span>{f.label}{f.hint === "len" && <span className="text-xs"> ({String(v[f.k] ?? "").length} characters)</span>}</span>
                {f.kind === "area" || f.kind === "big" ? (
                  <textarea className={`${inp} ${f.kind === "big" ? "min-h-[200px]" : "min-h-[84px]"}`} value={String(v[f.k] ?? "")} onChange={(e) => set(f.k, e.target.value as never)} />
                ) : (
                  <input className={inp} value={String(v[f.k] ?? "")} onChange={(e) => set(f.k, e.target.value as never)} autoCapitalize="none" spellCheck={false} />
                )}
              </label>
            ))}
          </section>
        ))}
        <section className="bd-gold-25 grid content-start gap-3 rounded-xl border p-4 xl:col-span-2">
          <h2 className="font-serif text-2xl text-gold">Tell search engines</h2>
          <p className="text-sm text-muted">Sends your public pages to Bing and other IndexNow search engines so they find changes sooner. Status 200 or 202 means they accepted it. Google does not use this: for Google, use Search Console.</p>
          <button className="bd-gold-40 w-fit rounded-full border px-5 py-3 text-sm text-gold" onClick={ping}>Notify search engines now</button>
          <p className="text-em">{note}</p>
        </section>
      </div>
      <SaveBar dirty={dirty} msg={msg} onSave={save} />
    </div>
  );
}

export default function Page() { return <Gate><Editor /></Gate>; }
