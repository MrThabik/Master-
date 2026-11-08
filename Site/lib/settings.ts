import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

// Everything you can change in Developer Space (Site Settings + Design & Layout)
export type Settings = {
  site_name: string; tagline: string; owner_name: string; also_known_as: string; job_title: string;
  hero_intro: string; footer_text: string; about_title: string; about_body: string;
  seo_title: string; seo_description: string; seo_keywords: string; same_as: string; google_verification: string;
  font_heading: string; font_body: string;
  color_bg: string; color_text: string; color_muted: string; gold: string; emerald: string;
  card_style: "glass" | "solid" | "outline"; radius: number; grid_columns: "auto" | "2" | "3" | "4";
  sections: string; show_ring: boolean; ring_height: number;
  dock_position: "bottom" | "top" | "hidden"; dock_links: string; show_theme_toggle: boolean;
  show_intro: boolean; intro_line1: string; intro_title: string; intro_tagline: string; intro_seconds: number; intro_every_visit: boolean; intro_bg: string;
  gallery_seconds: number; gallery_zoom: boolean; watermark_text: string; watermark_opacity: number;
  custom_css: string;
};

export const FONT_HEADINGS = ["Cormorant Garamond", "Playfair Display", "Cinzel", "Marcellus", "Merriweather", "Poppins", "Montserrat", "Space Grotesk", "Orbitron", "Inter"] as const;
export const FONT_BODIES = ["Inter", "Poppins", "Montserrat", "Roboto", "Open Sans", "Lato", "Nunito", "Space Grotesk"] as const;
export const CARD_STYLES = ["glass", "solid", "outline"] as const;
export const GRID_COLUMNS = ["auto", "2", "3", "4"] as const;
export const DOCK_POSITIONS = ["bottom", "top", "hidden"] as const;
export const SECTION_KEYS = ["hero", "ring", "grid"] as const;

export const DEFAULTS: Settings = {
  site_name: "THASEEN OS",
  tagline: "Artist • Engineer • Creator",
  owner_name: "Thaseen Shabik N",
  also_known_as: "Thaseen Shabik, Thaseen Shabik N",
  job_title: "Electrical & Automation Engineer",
  hero_intro: "Thaseen Shabik N · Electrical & Automation Engineer, Artist & Creator. All my websites in one place.",
  footer_text: "© 2026 Thaseen Shabik N",
  about_title: "About Thaseen Shabik N",
  about_body:
    "Thaseen Shabik N is an Electrical & Electronics diploma engineer with hands-on experience in FANUC robot programming, VMC machining and manufacturing, and also works as an artist and creator.\n\nThis website brings together his portfolio websites, photo and art gallery, mood-board and blog in Tamil and English.",
  seo_title: "Thaseen Shabik N | Electrical & Automation Engineer, Artist & Creator",
  seo_description:
    "Official website of Thaseen Shabik N: Electrical & Automation Engineer (FANUC robotics, VMC machining), artist and creator. Portfolio, photo and art gallery, mood-board and blog.",
  seo_keywords: "Thaseen Shabik, Thaseen Shabik N, Thaseen Shabik portfolio, Electrical engineer, FANUC robot programming, VMC machining, Tamil Nadu",
  same_as: process.env.NEXT_PUBLIC_SAME_AS ?? "https://mrthabik22.vercel.app, https://mrthabik23.vercel.app, https://mrthabik24.thaseenshabik.in",
  google_verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ?? "",
  font_heading: "Cormorant Garamond", font_body: "Inter",
  color_bg: "#060807", color_text: "#f2efe6", color_muted: "#9aa39d", gold: "#d4af37", emerald: "#34d399",
  card_style: "glass", radius: 16, grid_columns: "auto",
  sections: "hero,ring,grid", show_ring: true, ring_height: 340,
  dock_position: "bottom", dock_links: "Home|/\nGallery|/gallery\nMood|/moodboard\nBlog|/blog\nAbout|/about", show_theme_toggle: true,
  show_intro: true, intro_line1: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", intro_title: "", intro_tagline: "", intro_seconds: 5, intro_every_visit: false, intro_bg: "#060807",
  gallery_seconds: 7, gallery_zoom: true, watermark_text: "© THASEEN SHABIK", watermark_opacity: 12,
  custom_css: "",
};

export const PRESETS: Record<string, Pick<Settings, "color_bg" | "color_text" | "color_muted" | "gold" | "emerald">> = {
  "Luxury black, emerald & gold": { color_bg: "#060807", color_text: "#f2efe6", color_muted: "#9aa39d", gold: "#d4af37", emerald: "#34d399" },
  "Midnight blue & silver": { color_bg: "#070b16", color_text: "#e8ecf5", color_muted: "#8f9ab3", gold: "#c0c8d8", emerald: "#60a5fa" },
  "Royal purple & gold": { color_bg: "#0d0714", color_text: "#f3ecfa", color_muted: "#a596b8", gold: "#e0b84c", emerald: "#c084fc" },
  "Charcoal & orange": { color_bg: "#0f0f10", color_text: "#f4f1ec", color_muted: "#a29d96", gold: "#fb923c", emerald: "#fbbf24" },
  "Deep green & cream": { color_bg: "#06140e", color_text: "#f6f1e4", color_muted: "#9bb0a4", gold: "#e6c872", emerald: "#4ade80" },
};

const ALLOW_EMPTY = new Set(["google_verification", "intro_line1", "intro_title", "intro_tagline", "watermark_text", "custom_css"]);
const num = (v: unknown, min: number, max: number, d: number) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
const pick = <T extends string>(v: unknown, opts: readonly T[], d: T): T => (opts.includes(v as T) ? (v as T) : d);
export const safeColor = (c: unknown, fallback: string) => (typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c) ? c : fallback);

export const siteBase = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, "");
export const list = (s: string) => String(s ?? "").split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
export const cleanVerification = (s: string) => String(s ?? "").replace(/^\s*google-site-verification\s*=\s*/i, "").replace(/["'<>\s]/g, "");

export function parseNav(s: string): { label: string; href: string }[] {
  return String(s ?? "").split("\n").map((l) => l.split("|").map((x) => x.trim())).filter(([a, b]) => a && b && /^(\/|https?:\/\/)/.test(b)).map(([label, href]) => ({ label, href })).slice(0, 8);
}
export function parseSections(s: string): (typeof SECTION_KEYS)[number][] {
  const out = String(s ?? "").split(",").map((x) => x.trim()).filter((x): x is (typeof SECTION_KEYS)[number] => (SECTION_KEYS as readonly string[]).includes(x));
  const uniq = Array.from(new Set(out));
  return uniq.length ? uniq : [...SECTION_KEYS];
}
export const fontsHref = (h: string, b: string) => {
  const fh = pick(h, FONT_HEADINGS, "Cormorant Garamond"), fb = pick(b, FONT_BODIES, "Inter");
  const q = (f: string) => f.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${q(fh)}:wght@400;500;600;700&family=${q(fb)}:wght@400;500;600&family=Noto+Sans+Tamil:wght@400;600&family=Amiri:wght@400;700&display=swap`;
};
export function themeVars(s: Settings): Record<string, string> {
  const card = s.card_style === "solid" ? "color-mix(in srgb, var(--fg) 9%, var(--bg))" : s.card_style === "outline" ? "transparent" : "rgba(255,255,255,.05)";
  return { "--bg": s.color_bg, "--fg": s.color_text, "--muted": s.color_muted, "--gold": s.gold, "--em": s.emerald, "--card": card, "--radius": `${s.radius}px`, "--font-heading": `"${s.font_heading}"`, "--font-body": `"${s.font_body}"` };
}
export const themeStyle = (s: Settings) => themeVars(s) as unknown as CSSProperties;

function sanitize(s: Settings): Settings {
  const d = DEFAULTS;
  return {
    ...s,
    font_heading: pick(s.font_heading, FONT_HEADINGS, d.font_heading), font_body: pick(s.font_body, FONT_BODIES, d.font_body),
    color_bg: safeColor(s.color_bg, d.color_bg), color_text: safeColor(s.color_text, d.color_text), color_muted: safeColor(s.color_muted, d.color_muted),
    gold: safeColor(s.gold, d.gold), emerald: safeColor(s.emerald, d.emerald), intro_bg: safeColor(s.intro_bg, d.intro_bg),
    card_style: pick(s.card_style, CARD_STYLES, d.card_style), grid_columns: pick(String(s.grid_columns), GRID_COLUMNS, d.grid_columns),
    dock_position: pick(s.dock_position, DOCK_POSITIONS, d.dock_position),
    radius: num(s.radius, 0, 40, d.radius), ring_height: num(s.ring_height, 200, 600, d.ring_height),
    intro_seconds: num(s.intro_seconds, 3, 15, d.intro_seconds), gallery_seconds: num(s.gallery_seconds, 3, 20, d.gallery_seconds),
    watermark_opacity: num(s.watermark_opacity, 0, 60, d.watermark_opacity),
    sections: parseSections(s.sections).join(","), google_verification: cleanVerification(s.google_verification),
    show_intro: s.show_intro !== false, show_ring: s.show_ring !== false, show_theme_toggle: s.show_theme_toggle !== false,
    gallery_zoom: s.gallery_zoom !== false, intro_every_visit: s.intro_every_visit === true,
  };
}

export async function getSettings(): Promise<Settings> {
  try {
    const { data } = await supabase.from("settings").select("data").eq("id", 1).single();
    const saved = (data?.data ?? {}) as Record<string, unknown>;
    const out: Record<string, unknown> = { ...DEFAULTS };
    for (const [k, v] of Object.entries(saved)) if (k in DEFAULTS && v != null && (v !== "" || ALLOW_EMPTY.has(k))) out[k] = v;
    return sanitize(out as Settings);
  } catch {
    return DEFAULTS;
  }
}
