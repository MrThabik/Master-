import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { T, U } from "@/components/T";
import { UI } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const revalidate = 30;
export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getSettings(), "/contact", "Contact", "Contact Thaseen Shabik N: send a message or chat on WhatsApp.");
}

export default async function Contact() {
  const s = await getSettings();
  const wa = s.whatsapp_number ? `https://wa.me/${s.whatsapp_number}?text=${encodeURIComponent(s.whatsapp_message)}` : "";
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12">
      <Link href="/" className="text-sm text-em">← {s.site_name}</Link>
      <h1 className="mb-2 mt-6 font-serif text-4xl text-gold"><U k="contactTitle" /></h1>
      <p className="mb-6 text-muted"><T en={s.contact_intro || UI.contactIntro[0]} ta={s.contact_intro_ta || (s.contact_intro ? undefined : UI.contactIntro[1])} /></p>
      {wa && (
        <a href={wa} target="_blank" rel="noopener" className="mb-8 inline-block rounded-full bg-[#25d366] px-6 py-3 text-base font-medium text-black transition hover:scale-105"><U k="whatsapp" /></a>
      )}
      <ContactForm />
    </main>
  );
}
