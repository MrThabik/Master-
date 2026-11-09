import { ReactNode } from "react";
import { supabase, Site } from "@/lib/supabase";
import SiteCard from "@/components/SiteCard";
import Carousel3DLoader from "@/components/Carousel3DLoader";
import { getSettings, parseSections } from "@/lib/settings";
import { T } from "@/components/T";

export const revalidate = 30;
export const metadata = { alternates: { canonical: "/" } };

const COLS = {
  auto: "[grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]",
  "2": "grid-cols-1 sm:grid-cols-2",
  "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

export default async function Home() {
  const st = await getSettings();
  const { data } = await supabase.from("sites").select("*").eq("hidden", false).order("sort");
  const sites = (data as Site[] | null) ?? [];
  const blocks: Record<string, ReactNode> = {
    hero: (
      <header key="hero" className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[.35em] text-gold"><T en={st.tagline} ta={st.tagline_ta} /></p>
        <h1 className="bg-gradient-to-r from-[var(--gold)] via-[var(--fg)] to-[var(--em)] bg-clip-text font-serif text-4xl text-transparent sm:text-5xl lg:text-6xl">
          {st.site_name}<span className="sr-only"> by {st.owner_name}</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-muted"><T en={st.hero_intro} ta={st.hero_intro_ta} /></p>
      </header>
    ),
    ring: st.show_ring ? <Carousel3DLoader key="ring" sites={sites} height={st.ring_height} /> : null,
    grid: (
      <div key="grid" className={`mx-auto grid max-w-6xl gap-5 ${COLS[st.grid_columns]}`}>
        {sites.map((s) => <SiteCard key={s.id} s={s} />)}
      </div>
    ),
  };
  return <main className="min-h-screen bg-bg px-5 py-12 text-fg">{parseSections(st.sections).map((k) => blocks[k])}</main>;
}
