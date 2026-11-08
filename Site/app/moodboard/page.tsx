import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Moodboard from "@/components/Moodboard";

export const revalidate = 30;
export const metadata = { title: "Mood-board", description: "A mood-board of photos and inspiration by Thaseen Shabik N.", alternates: { canonical: "/moodboard" } };

export default async function MoodPage() {
  const { data } = await supabase.from("moods").select("*").order("sort");
  const items = (data ?? []).map((m) => ({
    id: m.id, caption: m.caption,
    url: supabase.storage.from("gallery").getPublicUrl(m.image_path).data.publicUrl,
  }));
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-12">
      <Link href="/" className="text-sm text-em">← THASEEN OS</Link>
      <header className="my-6 text-center">
        <p className="text-xs uppercase tracking-[.35em] text-gold">Inspiration</p>
        <h1 className="bg-gradient-to-r from-[var(--gold)] via-[var(--fg)] to-[var(--em)] bg-clip-text font-serif text-5xl text-transparent">MOOD-BOARD</h1>
      </header>
      <Moodboard items={items} />
    </main>
  );
}
