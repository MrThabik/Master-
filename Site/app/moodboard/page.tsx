import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Moodboard from "@/components/Moodboard";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const revalidate = 30;
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMeta(s, "/moodboard", "Mood-board", "A mood-board of photos and inspiration by Thaseen Shabik N.");
}

export default async function MoodPage() {
  const st = await getSettings();
  const { data } = await supabase.from("moods").select("*").order("sort");
  const items = (data ?? []).filter((m) => !m.hidden).map((m) => ({ id: m.id, caption: m.caption ?? "", url: supabase.storage.from("gallery").getPublicUrl(m.image_path).data.publicUrl }));
  return (
    <main className="mx-auto min-h-screen px-4 py-12" style={{ maxWidth: "var(--content-w)" }}>
      <Link href="/" className="text-sm text-em">← {st.site_name}</Link>
      <header className="my-6 text-center">
        <p className="text-xs uppercase tracking-[.35em] text-gold">Inspiration</p>
        <h1 className="bg-gradient-to-r from-[var(--gold)] via-[var(--fg)] to-[var(--em)] bg-clip-text font-serif text-5xl text-transparent">{st.mood_title}</h1>
        {st.mood_intro && <p className="mx-auto mt-2 max-w-xl text-muted">{st.mood_intro}</p>}
      </header>
      <Moodboard items={items} opts={{ layout: st.mood_layout, columns: st.mood_columns, gap: st.mood_gap, radius: st.mood_radius, hover: st.mood_hover, caption: st.mood_caption, frame: st.mood_frame, shuffle: st.mood_shuffle }} />
    </main>
  );
}
