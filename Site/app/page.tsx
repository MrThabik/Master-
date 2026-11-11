import { ReactNode } from "react";
import Link from "next/link";
import { supabase, Site } from "@/lib/supabase";
import SiteCard from "@/components/SiteCard";
import Carousel3DLoader from "@/components/Carousel3DLoader";
import SubscribeBox from "@/components/SubscribeBox";
import { getSettings, parseSections } from "@/lib/settings";
import { T, U } from "@/components/T";

export const revalidate = 30;
export const metadata = { alternates: { canonical: "/" } };

const COLS = {
  auto: "[grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]",
  "2": "grid-cols-1 sm:grid-cols-2",
  "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;
type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export default async function Home() {
  const st = await getSettings();
  const order = parseSections(st.sections);
  const need = (k: string) => (order as string[]).includes(k);
  const { data } = await supabase.from("sites").select("*").eq("hidden", false).order("sort");
  const sites = (data as Site[] | null) ?? [];
  const posts: Row[] = need("posts") ? ((await supabase.from("posts").select("*").eq("published", true).order("created_at", { ascending: false }).limit(st.home_posts_count)).data ?? []) : [];
  const arts: Row[] = need("gallery") ? ((await supabase.from("artworks").select("*").order("sort").limit(40)).data ?? []).filter((a: Row) => !a.hidden).slice(0, st.home_gallery_count) : [];
  const left = st.hero_align === "left";
  const wrap = "mx-auto w-full";
  const firstPara = (txt: string) => txt.split(/\n\s*\n/)[0] ?? "";
  const box: React.CSSProperties = { maxWidth: "var(--content-w)", marginBottom: "var(--gap)" };
  const heading = (c: ReactNode) => <h2 className="mb-3 font-serif text-3xl text-gold">{c}</h2>;

  const blocks: Record<string, ReactNode> = {
    hero: (
      <header key="hero" className={`${wrap} ${left ? "text-left" : "text-center"}`} style={box}>
        <p className="text-xs uppercase tracking-[.35em] text-gold"><T en={st.tagline} ta={st.tagline_ta} /></p>
        <h1 className="bg-gradient-to-r from-[var(--gold)] via-[var(--fg)] to-[var(--em)] bg-clip-text font-serif text-4xl text-transparent sm:text-5xl lg:text-6xl">
          {st.site_name}<span className="sr-only"> by {st.owner_name}</span>
        </h1>
        <p className={`mt-2 max-w-xl text-muted ${left ? "" : "mx-auto"}`}><T en={st.hero_intro} ta={st.hero_intro_ta} /></p>
      </header>
    ),
    ring: st.show_ring ? <div key="ring" style={{ marginBottom: "var(--gap)" }}><Carousel3DLoader sites={sites} height={st.ring_height} /></div> : null,
    grid: (
      <div key="grid" className={`${wrap} grid gap-5 ${COLS[st.grid_columns]}`} style={box}>
        {sites.map((s) => <SiteCard key={s.id} s={s} />)}
      </div>
    ),
    about: (
      <section key="about" className={wrap} style={{ ...box, maxWidth: "min(var(--content-w), 48rem)" }}>
        {heading(<T en={st.about_title} ta={st.about_title_ta} />)}
        <p className="text-muted"><T en={firstPara(st.about_body)} ta={firstPara(st.about_body_ta)} /></p>
        <Link href="/about" className="mt-3 inline-block text-em underline"><U k="readMore" /></Link>
      </section>
    ),
    posts: posts.length ? (
      <section key="posts" className={wrap} style={box}>
        {heading(<U k="latestPosts" />)}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="bd-gold-25 r-card block border bg-card p-4 transition hover:-translate-y-1 hover:border-em">
              <p className="text-xs uppercase tracking-wider text-em">{p.topic} · {String(p.created_at).slice(0, 10)}</p>
              <h3 className="my-1 font-serif text-2xl text-gold">{p.title}</h3>
              <p className="text-sm text-muted">{String(p.excerpt || p.body || "").replace(/[#*>`\[\]!]/g, "").slice(0, 110)}…</p>
            </Link>
          ))}
        </div>
      </section>
    ) : null,
    gallery: arts.length ? (
      <section key="gallery" className={wrap} style={box}>
        {heading(<U k="galleryTitle" />)}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {arts.map((a) => (
            <Link key={a.id} href="/gallery" className="r-card block aspect-square overflow-hidden transition hover:scale-[1.03]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={supabase.storage.from("gallery").getPublicUrl(a.image_path).data.publicUrl} alt={a.title} loading="lazy" className="h-full w-full object-cover" />
            </Link>
          ))}
        </div>
      </section>
    ) : null,
    contact: (
      <section key="contact" className={`${wrap} bd-gold-30 r-card border bg-card p-6 text-center`} style={{ ...box, maxWidth: "min(var(--content-w), 40rem)" }}>
        <h2 className="font-serif text-3xl text-gold"><U k="contactCta" /></h2>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="border-em rounded-full border px-6 py-3 text-em"><U k="contactTitle" /></Link>
          {st.whatsapp_number && <a href={`https://wa.me/${st.whatsapp_number}?text=${encodeURIComponent(st.whatsapp_message)}`} target="_blank" rel="noopener" className="rounded-full bg-[#25d366] px-6 py-3 font-medium text-black"><U k="whatsapp" /></a>}
        </div>
      </section>
    ),
    text: st.home_text_title || st.home_text_body ? (
      <section key="text" className={wrap} style={{ ...box, maxWidth: "min(var(--content-w), 48rem)" }}>
        {st.home_text_title && heading(st.home_text_title)}
        <p className="whitespace-pre-line text-muted">{st.home_text_body}</p>
      </section>
    ) : null,
    subscribe: <div key="subscribe" className={wrap} style={{ ...box, maxWidth: "min(var(--content-w), 40rem)" }}><SubscribeBox /></div>,
  };
  return <main className="min-h-screen px-5 py-12 text-fg">{order.map((k) => blocks[k])}</main>;
}
