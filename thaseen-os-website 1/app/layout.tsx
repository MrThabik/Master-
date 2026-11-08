import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import Intro from "@/components/Intro";
import Dock from "@/components/Dock";
import { fontsHref, getSettings, list, parseNav, siteBase, themeVars } from "@/lib/settings";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const base = siteBase();
  return {
    metadataBase: new URL(base),
    title: { default: s.seo_title, template: `%s | ${s.owner_name}` },
    description: s.seo_description,
    applicationName: s.site_name,
    authors: [{ name: s.owner_name, url: base }],
    creator: s.owner_name,
    keywords: list(s.seo_keywords),
    alternates: { canonical: "/" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: { type: "website", url: base, siteName: s.site_name, title: s.seo_title, description: s.seo_description, locale: "en_IN" },
    twitter: { card: "summary_large_image", title: s.seo_title, description: s.seo_description },
    verification: { google: s.google_verification || undefined },
  };
}
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const s = await getSettings();
  const base = siteBase();
  const names = Array.from(new Set([s.owner_name, ...list(s.also_known_as)]));
  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "Person", "@id": `${base}/#person`,
      name: s.owner_name, alternateName: names, jobTitle: s.job_title, url: base, sameAs: list(s.same_as),
      knowsAbout: ["Electrical and Electronics Engineering", "FANUC robot programming", "VMC machining", "Renewable energy systems", "Photography", "Digital art"],
    },
    {
      "@context": "https://schema.org", "@type": "WebSite", "@id": `${base}/#website`,
      name: s.site_name, alternateName: `${s.owner_name} official website`, url: base, inLanguage: ["en", "ta"],
      publisher: { "@id": `${base}/#person` },
    },
  ];
  const vars = Object.entries(themeVars(s)).map(([k, v]) => `${k}:${v}`).join(";");
  const css = `:root:not(.light){${vars}}\n${s.custom_css.replace(/</g, "\\3c ")}`;
  const nav = parseNav(s.dock_links);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href={fontsHref(s.font_heading, s.font_body)} rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('light')}catch(e){}" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </head>
      <body className={s.dock_position === "top" ? "pt-20 pb-6" : s.dock_position === "hidden" ? "pb-6" : "pb-28"}>
        {s.show_intro && (
          <Intro line1={s.intro_line1} title={s.intro_title || s.site_name} tagline={s.intro_tagline || s.tagline} seconds={s.intro_seconds} everyVisit={s.intro_every_visit} bg={s.intro_bg} />
        )}
        {children}
        <footer className="px-4 pb-4 text-center text-xs text-muted">{s.footer_text}</footer>
        {s.dock_position !== "hidden" && <Dock links={nav} position={s.dock_position} showToggle={s.show_theme_toggle} />}
      </body>
    </html>
  );
}
