import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, list, siteBase } from "@/lib/settings";
import { T, U } from "@/components/T";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: { absolute: s.about_title }, description: s.about_body.replace(/\s+/g, " ").slice(0, 155), alternates: { canonical: "/about" } };
}

export default async function About() {
  const s = await getSettings();
  const base = siteBase();
  const ld = {
    "@context": "https://schema.org", "@type": "ProfilePage", url: `${base}/about`,
    mainEntity: { "@type": "Person", "@id": `${base}/#person`, name: s.owner_name, jobTitle: s.job_title, description: s.about_body.replace(/\s+/g, " ").slice(0, 300), sameAs: list(s.same_as) },
  };
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12 leading-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Link href="/" className="text-sm text-em">← {s.site_name}</Link>
      <p className="mt-6 text-xs uppercase tracking-[.35em] text-gold"><T en={s.tagline} ta={s.tagline_ta} /></p>
      <h1 className="my-2 font-serif text-4xl text-gold"><T en={s.about_title} ta={s.about_title_ta} /></h1>
      <p className="mb-6 text-muted">{s.job_title}</p>
      {s.about_body.split(/\n\s*\n/).map((p, i) => <p key={i} className="mb-4 whitespace-pre-line"><T en={p} ta={s.about_body_ta.split(/\n\s*\n/)[i]} /></p>)}
      <h2 className="mb-2 mt-8 font-serif text-2xl text-gold"><U k="myWebsites" /></h2>
      <ul className="list-disc pl-5">
        {list(s.same_as).map((u) => <li key={u}><a className="text-em underline" href={u} rel="noopener">{u.replace(/^https?:\/\//, "")}</a></li>)}
      </ul>
    </main>
  );
}
