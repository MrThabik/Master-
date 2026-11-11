import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SubscribeBox from "@/components/SubscribeBox";
import ShareBar from "@/components/ShareBar";
import { U } from "@/components/T";
import { getSettings, siteBase } from "@/lib/settings";
import { Md, plainText, readingMinutes } from "@/lib/md";

export const revalidate = 30;
const coverOf = (p?: string | null) => (p ? supabase.storage.from("gallery").getPublicUrl(p).data.publicUrl : "");

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: p } = await supabase.from("posts").select("*").eq("slug", params.slug).eq("published", true).single();
  if (!p) return {};
  const description = (p.excerpt || plainText(p.body)).slice(0, 155);
  const img = coverOf(p.cover_path);
  return {
    title: p.title, description, alternates: { canonical: `/blog/${params.slug}` },
    openGraph: { type: "article", title: p.title, description, publishedTime: p.created_at, authors: ["Thaseen Shabik N"], images: img ? [img] : undefined },
  };
}

export default async function Post({ params }: { params: { slug: string } }) {
  const { data: p } = await supabase.from("posts").select("*").eq("slug", params.slug).eq("published", true).single();
  if (!p) notFound();
  const st = await getSettings();
  const url = `${siteBase()}/blog/${params.slug}`;
  const img = coverOf(p.cover_path);
  const maxW = st.post_width === "narrow" ? "36rem" : st.post_width === "wide" ? "56rem" : "44rem";
  const tpl = st.post_template;
  const center = tpl === "centered";
  const ld = { "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, datePublished: p.created_at, inLanguage: p.lang === "Tamil" ? "ta" : "en", image: img || undefined, author: { "@type": "Person", name: "Thaseen Shabik N" } };
  const tags = String(p.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean);
  return (
    <main className="mx-auto min-h-screen px-5 py-12" style={{ maxWidth: tpl === "editorial" ? "60rem" : maxW }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Link href="/blog" className="bd-gold-40 rounded-full border px-4 py-1 text-sm text-gold"><U k="allPosts" /></Link>
      <header className={`mt-8 ${center ? "text-center" : ""}`}>
        <p className="text-xs uppercase tracking-wider text-em">{p.topic} · {p.created_at.slice(0, 10)}{st.post_show_time && ` · ${readingMinutes(p.body)} min`}</p>
        <h1 className={`my-2 font-serif text-gold ${tpl === "editorial" ? "text-5xl sm:text-6xl" : "text-4xl"}`}>{p.title}</h1>
        {tags.length > 0 && <p className="text-sm text-muted">{tags.map((t: string) => `#${t}`).join("  ")}</p>}
      </header>
      {img && <img src={img} alt="" className={`r-card my-6 w-full object-cover ${tpl === "editorial" ? "max-h-[28rem]" : "max-h-96"}`} />}
      <article className={`${tpl === "editorial" ? "dropcap mx-auto" : ""} ${center ? "mx-auto text-center" : ""}`} style={{ fontSize: `${st.post_size}px`, lineHeight: 1.75, maxWidth: tpl === "editorial" ? maxW : undefined }}>
        <Md text={p.body} />
      </article>
      {st.post_show_share && <ShareBar url={url} title={p.title} />}
      {st.post_show_subscribe && <SubscribeBox />}
    </main>
  );
}
