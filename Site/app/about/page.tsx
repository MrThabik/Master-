import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, list, siteBase } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";
import { T, U } from "@/components/T";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMeta(s, "/about", s.about_title, s.about_body.replace(/\s+/g, " ").slice(0, 155));
}

export default async function About() {
  const s = await getSettings();
  const base = siteBase();
  const ld = {
    "@context": "https://schema.org", "@type": "ProfilePage", url: `${base}/about`,
    mainEntity: { "@type": "Person", "@id": `${base}/#person`, name: s.owner_name, jobTitle: s.job_title, description: s.about_body.replace(/\s+/g, " ").slice(0, 300), sameAs: list(s.same_as) },
  };
  const taParas = s.about_body_ta.split(/\n\s*\n/);
  const body = s.about_blocks.length ? (
    s.about_blocks.map((b, i) => {
      const t = <T en={b.en} ta={b.ta} />;
      if (b.type === "heading") return <h2 key={i} className="mb-2 mt-8 break-inside-avoid font-serif text-2xl text-gold">{t}</h2>;
      if (b.type === "quote") return <blockquote key={i} className="my-5 break-inside-avoid border-l-4 border-gold pl-4 italic text-muted">{t}</blockquote>;
      if (b.type === "divider") return <hr key={i} className="bd-gold-25 my-8 border-t" />;
      if (b.type === "list") {
        const en = b.en.split("\n").filter(Boolean), ta = b.ta.split("\n").filter(Boolean);
        return <ul key={i} className="my-3 list-disc break-inside-avoid pl-6">{en.map((x, j) => <li key={j}><T en={x} ta={ta[j]} /></li>)}</ul>;
      }
      return <p key={i} className="mb-4 whitespace-pre-line break-inside-avoid">{t}</p>;
    })
  ) : (
    s.about_body.split(/\n\s*\n/).map((p, i) => <p key={i} className="mb-4 whitespace-pre-line break-inside-avoid"><T en={p} ta={taParas[i]} /></p>)
  );
  const wide = s.about_layout === "columns";
  return (
    <main className={`mx-auto min-h-screen px-5 py-12 leading-8 ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Link href="/" className="text-sm text-em">← {s.site_name}</Link>
      <p className="mt-6 text-xs uppercase tracking-[.35em] text-gold"><T en={s.tagline} ta={s.tagline_ta} /></p>
      <h1 className="my-2 font-serif text-4xl text-gold"><T en={s.about_title} ta={s.about_title_ta} /></h1>
      <p className="mb-6 text-muted">{s.job_title}</p>
      <div className={s.about_layout === "card" ? "bd-gold-30 r-card border bg-card p-6" : wide ? "md:columns-2 md:gap-10" : ""}>{body}</div>
      <h2 className="mb-2 mt-8 font-serif text-2xl text-gold"><U k="myWebsites" /></h2>
      <ul className="list-disc pl-5">
        {list(s.same_as).map((u) => <li key={u}><a className="text-em underline" href={u} rel="noopener">{u.replace(/^https?:\/\//, "")}</a></li>)}
      </ul>
    </main>
  );
}
