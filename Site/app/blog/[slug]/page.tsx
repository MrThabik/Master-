import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SubscribeBox from "@/components/SubscribeBox";
import { U } from "@/components/T";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: p } = await supabase.from("posts").select("title,body,created_at").eq("slug", params.slug).eq("published", true).single();
  if (!p) return {};
  const description = String(p.body).replace(/\s+/g, " ").slice(0, 155);
  return {
    title: p.title, description, alternates: { canonical: `/blog/${params.slug}` },
    openGraph: { type: "article", title: p.title, description, publishedTime: p.created_at, authors: ["Thaseen Shabik N"] },
  };
}

export default async function Post({ params }: { params: { slug: string } }) {
  const { data: p } = await supabase.from("posts").select("*").eq("slug", params.slug).eq("published", true).single();
  if (!p) notFound();
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12 leading-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, datePublished: p.created_at, inLanguage: p.lang === "Tamil" ? "ta" : "en", author: { "@type": "Person", name: "Thaseen Shabik N" } }).replace(/</g, "\\u003c") }} />
      <Link href="/blog" className="rounded-full border border-gold px-4 py-1 text-sm text-gold"><U k="allPosts" /></Link>
      <p className="mt-8 text-xs uppercase tracking-wider text-em">{p.topic} · {p.created_at.slice(0, 10)}</p>
      <h1 className="my-2 font-serif text-4xl text-gold">{p.title}</h1>
      {String(p.body).split(/\n\s*\n/).map((para: string, i: number) => (
        <p key={i} className="mb-4 whitespace-pre-line">{para}</p>
      ))}
      <SubscribeBox />
    </main>
  );
}
