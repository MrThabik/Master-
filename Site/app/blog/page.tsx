import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SubscribeBox from "@/components/SubscribeBox";
import { U } from "@/components/T";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";
import { plainText, readingMinutes } from "@/lib/md";

export const revalidate = 30;
export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getSettings(), "/blog", "Blog (Tamil & English)", "Notes on engineering, art and learning by Thaseen Shabik N, in Tamil and English.");
}

type P = { slug: string; title: string; lang: string; topic: string; body: string; created_at: string; excerpt?: string; cover_path?: string | null; featured?: boolean };

export default async function Blog({ searchParams }: { searchParams: { lang?: string } }) {
  const st = await getSettings();
  const lang = searchParams.lang;
  const { data } = await supabase.from("posts").select("*").eq("published", true);
  let posts = ((data as P[] | null) ?? []).filter((p) => lang !== "English" && lang !== "Tamil" ? true : p.lang === lang);
  posts = posts.sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.created_at.localeCompare(a.created_at));
  const cover = (p: P) => (p.cover_path ? supabase.storage.from("gallery").getPublicUrl(p.cover_path).data.publicUrl : "");
  const chip = (l: string, label: string) => (
    <Link href={l === "All" ? "/blog" : `/blog?lang=${l}`} className={`bd-gold-30 rounded-full border px-4 py-1 text-sm ${(lang ?? "All") === l ? "bg-gold text-black" : ""}`}>{label}</Link>
  );
  const meta = (p: P) => st.blog_show_meta && (
    <div className="text-xs uppercase tracking-wider text-em">{p.topic} · {p.created_at.slice(0, 10)} · {p.lang === "Tamil" ? "தமிழ்" : "English"}{st.post_show_time && ` · ${readingMinutes(p.body)} min`}</div>
  );
  const excerpt = (p: P, n = 140) => st.blog_show_excerpt && <p className="mt-1 text-sm text-muted">{(p.excerpt || plainText(p.body)).slice(0, n)}…</p>;
  const card = (p: P, variant: "card" | "row" | "big") => {
    const c = cover(p);
    return (
      <Link key={p.slug} href={`/blog/${p.slug}`} className={`bd-gold-25 r-card adm-card block overflow-hidden border bg-card ${variant === "row" ? "sm:flex" : ""}`}>
        {c && <img src={c} alt="" loading="lazy" className={variant === "row" ? "h-40 w-full object-cover sm:h-auto sm:w-48" : variant === "big" ? "h-64 w-full object-cover sm:h-80" : "h-44 w-full object-cover"} />}
        <div className="p-4">
          {meta(p)}
          <h2 className={`my-1 font-serif text-gold ${variant === "big" ? "text-4xl" : "text-2xl"}`}>{p.featured ? "★ " : ""}{p.title}</h2>
          {excerpt(p, variant === "big" ? 220 : 140)}
        </div>
      </Link>
    );
  };
  const width = st.blog_layout === "magazine" || st.blog_columns === 2 ? "56rem" : "44rem";
  return (
    <main className="mx-auto min-h-screen px-5 py-12" style={{ maxWidth: width }}>
      <Link href="/" className="text-sm text-em">← {st.site_name}</Link>
      <header className="my-6 text-center">
        <p className="text-xs uppercase tracking-[.35em] text-gold">{st.tagline}</p>
        <h1 className="bg-gradient-to-r from-[var(--gold)] via-[var(--fg)] to-[var(--em)] bg-clip-text font-serif text-5xl text-transparent">{st.blog_title}</h1>
        {st.blog_intro && <p className="mx-auto mt-2 max-w-xl text-muted">{st.blog_intro}</p>}
      </header>
      <div className="mb-6 flex justify-center gap-2">{chip("All", "All")}{chip("English", "English")}{chip("Tamil", "தமிழ்")}</div>
      {st.blog_layout === "list" && <div className="grid gap-4">{posts.map((p) => card(p, "row"))}</div>}
      {st.blog_layout === "magazine" && posts.length > 0 && (
        <div className="grid gap-4">
          {card(posts[0], "big")}
          <div className="grid gap-4 sm:grid-cols-2">{posts.slice(1).map((p) => card(p, "card"))}</div>
        </div>
      )}
      {st.blog_layout === "cards" && <div className={`grid gap-4 ${st.blog_columns === 2 ? "sm:grid-cols-2" : ""}`}>{posts.map((p) => card(p, "card"))}</div>}
      {!posts.length && <p className="text-center text-muted"><U k="noPosts" /></p>}
      {st.post_show_subscribe && <SubscribeBox />}
    </main>
  );
}
