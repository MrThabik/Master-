import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 30;
export const metadata = { title: "Blog (Tamil & English)", description: "Notes on engineering, art and learning by Thaseen Shabik N, in Tamil and English.", alternates: { canonical: "/blog" } };

export default async function Blog({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = searchParams.lang;
  let q = supabase.from("posts").select("slug,title,lang,topic,body,created_at").eq("published", true).order("created_at", { ascending: false });
  if (lang === "English" || lang === "Tamil") q = q.eq("lang", lang);
  const { data } = await q;

  const chip = (l: string, label: string) => (
    <Link href={l === "All" ? "/blog" : `/blog?lang=${l}`} className={`rounded-full border bd-gold-30 px-4 py-1 text-sm ${(lang ?? "All") === l ? "bg-gold text-black" : ""}`}>{label}</Link>
  );

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-12">
      <Link href="/" className="text-sm text-em">← THASEEN OS</Link>
      <header className="my-6 text-center">
        <p className="text-xs uppercase tracking-[.35em] text-gold">Artist • Engineer • Creator</p>
        <h1 className="bg-gradient-to-r from-[var(--gold)] via-[var(--fg)] to-[var(--em)] bg-clip-text font-serif text-5xl text-transparent">THASEEN NOTES</h1>
      </header>
      <div className="mb-6 flex justify-center gap-2">{chip("All", "All")}{chip("English", "English")}{chip("Tamil", "தமிழ்")}</div>
      {data?.map((p) => (
        <Link key={p.slug} href={`/blog/${p.slug}`} className="mb-4 block rounded-2xl border bd-gold-25 bg-card p-4 transition hover:-translate-y-1 hover:border-em">
          <div className="text-xs uppercase tracking-wider text-em">{p.topic} · {p.created_at.slice(0, 10)} · {p.lang === "Tamil" ? "தமிழ்" : "English"}</div>
          <h2 className="my-1 font-serif text-2xl text-gold">{p.title}</h2>
          <p className="text-sm text-muted">{p.body.slice(0, 130)}…</p>
        </Link>
      ))}
      {!data?.length && <p className="text-center text-muted">No posts yet.</p>}
    </main>
  );
}
