import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { NAV_TA } from "@/lib/i18n";

export type AboutBlock = { type: "heading" | "text" | "list" | "quote" | "divider"; en: string; ta: string };
export type PageSeo = Record<string, { title: string; description: string }>;

// Everything you can change in Developer Space (Design & Layout, Site Settings, Gallery, Mood-board and Blog looks)
export type Settings = {
  site_name: string; tagline: string; owner_name: string; also_known_as: string; job_title: string;
  hero_intro: string; footer_text: string; about_title: string; about_body: string;
  seo_title: string; seo_description: string; seo_keywords: string; same_as: string; google_verification: string;
  font_heading: string; font_body: string; tamil_font: string;
  heading_weight: "normal" | "bold"; heading_italic: boolean; heading_upper: boolean; heading_track: number; base_size: number; line_height: number;
  color_bg: string; color_text: string; color_muted: string; gold: string; emerald: string;
  card_style: "glass" | "solid" | "outline"; radius: number; grid_columns: "auto" | "2" | "3" | "4";
  bg_style: "solid" | "glow" | "gradient" | "dots"; layout_width: "narrow" | "normal" | "wide"; section_gap: number; hero_align: "center" | "left";
  sections: string; show_ring: boolean; ring_height: number;
  home_text_title: string; home_text_body: string; home_posts_count: number; home_gallery_count: number;
  dock_position: "bottom" | "top" | "hidden"; dock_links: string; show_theme_toggle: boolean;
  show_intro: boolean; intro_line1: string; intro_title: string; intro_tagline: string; intro_seconds: number; intro_every_visit: boolean; intro_bg: string;
  intro_style: "fade" | "rise" | "zoom" | "blur" | "typewriter";
  gallery_seconds: number; gallery_zoom: boolean; watermark_text: string; watermark_opacity: number;
  gallery_albums: string; gallery_layout: "slider" | "masonry"; gallery_transition: "fade" | "slide" | "zoom" | "none";
  gallery_overlay: number; gallery_caption: boolean; gallery_autoplay: boolean; gallery_arrows: boolean; gallery_whole_bg: "blur" | "black";
  mood_title: string; mood_intro: string; mood_layout: "masonry" | "grid" | "strip"; mood_columns: number; mood_gap: number; mood_radius: number;
  mood_hover: "zoom" | "lift" | "none"; mood_caption: "hover" | "always" | "hidden"; mood_frame: "none" | "border" | "polaroid"; mood_shuffle: boolean;
  blog_title: string; blog_intro: string; blog_layout: "cards" | "list" | "magazine"; blog_columns: number; blog_show_meta: boolean; blog_show_excerpt: boolean;
  post_template: "classic" | "centered" | "editorial"; post_size: number; post_width: "narrow" | "normal" | "wide";
  post_show_share: boolean; post_show_subscribe: boolean; post_show_time: boolean;
  about_blocks: AboutBlock[]; about_layout: "simple" | "card" | "columns"; page_seo: PageSeo;
  ga_id: string; bing_verification: string; robots_index: boolean;
  custom_css: string;
  tagline_ta: string; hero_intro_ta: string; footer_text_ta: string; about_title_ta: string; about_body_ta: string;
  contact_intro: string; contact_intro_ta: string; whatsapp_number: string; whatsapp_message: string;
  show_whatsapp_float: boolean; show_lang_toggle: boolean;
};

const FW = ["Cormorant Garamond", "Playfair Display", "Cinzel", "Marcellus", "Libre Baskerville", "DM Serif Display", "Abril Fatface", "Bebas Neue", "Oswald", "Raleway", "Merriweather", "Lora", "Poppins", "Montserrat", "Space Grotesk", "Orbitron", "Inter"] as const;
export const FONT_HEADINGS = FW;
export const FONT_BODIES = ["Inter", "Poppins", "Montserrat", "Roboto", "Open Sans", "Lato", "Nunito", "Source Sans 3", "DM Sans", "Work Sans", "Mukta", "Space Grotesk"] as const;
export const TAMIL_FONTS = ["Noto Sans Tamil", "Hind Madurai", "Mukta Malar", "Catamaran", "Noto Serif Tamil"] as const;
const SINGLE_WEIGHT = new Set(["Marcellus", "DM Serif Display", "Abril Fatface", "Bebas Neue"]);
export const CARD_STYLES = ["glass", "solid", "outline"] as const;
export const GRID_COLUMNS = ["auto", "2", "3", "4"] as const;
export const DOCK_POSITIONS = ["bottom", "top", "hidden"] as const;
export const SECTION_KEYS = ["hero", "ring", "grid", "about", "posts", "gallery", "contact", "text", "subscribe"] as const;
export const SECTION_LABELS: Record<(typeof SECTION_KEYS)[number], string> = {
  hero: "Title and intro text", ring: "3D rotating cards", grid: "Website cards", about: "About me (short)",
  posts: "Latest blog posts", gallery: "Photo strip", contact: "Contact button", text: "Your own text block", subscribe: "Subscribe box",
};
const ENUMS = {
  heading_weight: ["normal", "bold"], bg_style: ["solid", "glow", "gradient", "dots"], layout_width: ["narrow", "normal", "wide"], hero_align: ["center", "left"],
  intro_style: ["fade", "rise", "zoom", "blur", "typewriter"], gallery_layout: ["slider", "masonry"], gallery_transition: ["fade", "slide", "zoom", "none"],
  gallery_whole_bg: ["blur", "black"], mood_layout: ["masonry", "grid", "strip"], mood_hover: ["zoom", "lift", "none"], mood_caption: ["hover", "always", "hidden"],
  mood_frame: ["none", "border", "polaroid"], blog_layout: ["cards", "list", "magazine"], post_template: ["classic", "centered", "editorial"],
  post_width: ["narrow", "normal", "wide"], about_layout: ["simple", "card", "columns"],
} as const;

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
  font_heading: "Cormorant Garamond", font_body: "Inter", tamil_font: "Noto Sans Tamil",
  heading_weight: "normal", heading_italic: false, heading_upper: false, heading_track: 0, base_size: 16, line_height: 15,
  color_bg: "#060807", color_text: "#f2efe6", color_muted: "#9aa39d", gold: "#d4af37", emerald: "#34d399",
  card_style: "glass", radius: 16, grid_columns: "auto",
  bg_style: "solid", layout_width: "normal", section_gap: 40, hero_align: "center",
  sections: "hero,ring,grid", show_ring: true, ring_height: 340,
  home_text_title: "", home_text_body: "", home_posts_count: 3, home_gallery_count: 6,
  dock_position: "bottom", dock_links: "Home|/\nGallery|/gallery\nMood|/moodboard\nBlog|/blog\nAbout|/about", show_theme_toggle: true,
  show_intro: true, intro_line1: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", intro_title: "", intro_tagline: "", intro_seconds: 5, intro_every_visit: false, intro_bg: "#060807",
  intro_style: "fade",
  gallery_seconds: 7, gallery_zoom: true, watermark_text: "© THASEEN SHABIK", watermark_opacity: 12,
  gallery_albums: "Photography, Digital Art, Drawings & Paintings", gallery_layout: "slider", gallery_transition: "fade",
  gallery_overlay: 100, gallery_caption: true, gallery_autoplay: true, gallery_arrows: true, gallery_whole_bg: "blur",
  mood_title: "MOOD-BOARD", mood_intro: "", mood_layout: "masonry", mood_columns: 4, mood_gap: 12, mood_radius: 12,
  mood_hover: "zoom", mood_caption: "hover", mood_frame: "none", mood_shuffle: false,
  blog_title: "THASEEN NOTES", blog_intro: "", blog_layout: "cards", blog_columns: 1, blog_show_meta: true, blog_show_excerpt: true,
  post_template: "classic", post_size: 17, post_width: "normal", post_show_share: true, post_show_subscribe: true, post_show_time: true,
  about_blocks: [], about_layout: "simple", page_seo: {},
  ga_id: "", bing_verification: "", robots_index: true,
  custom_css: "",
  tagline_ta: "கலைஞர் • பொறியாளர் • படைப்பாளர்",
  hero_intro_ta: "Thaseen Shabik N · மின் மற்றும் தானியங்கு பொறியாளர், கலைஞர் மற்றும் படைப்பாளர். என் அனைத்து இணையதளங்களும் ஒரே இடத்தில்.",
  footer_text_ta: "",
  about_title_ta: "Thaseen Shabik N பற்றி",
  about_body_ta: "Thaseen Shabik N ஒரு எலக்ட்ரிக்கல் & எலக்ட்ரானிக்ஸ் டிப்ளமா பொறியாளர். FANUC ரோபோ நிரலாக்கம், VMC இயந்திரவியல் மற்றும் உற்பத்தித் துறையில் நேரடி அனுபவம் கொண்டவர்; கலைஞராகவும் படைப்பாளராகவும் செயல்படுகிறார்.\n\nஇந்த இணையதளம் அவரது போர்ட்ஃபோலியோ இணையதளங்கள், புகைப்படம் மற்றும் கலைத் தொகுப்பு, மூட்-போர்டு மற்றும் தமிழ், ஆங்கில வலைப்பதிவை ஒரே இடத்தில் கொண்டு வருகிறது.",
  contact_intro: "", contact_intro_ta: "",
  whatsapp_number: "", whatsapp_message: "Hello, I found your website and would like to talk.",
  show_whatsapp_float: true, show_lang_toggle: true,
};

// ----- One-tap templates: each one sets the whole look -----
const DESIGN_BASE: Partial<Settings> = {
  font_heading: "Cormorant Garamond", font_body: "Inter", tamil_font: "Noto Sans Tamil", heading_weight: "normal", heading_italic: false, heading_upper: false, heading_track: 0,
  base_size: 16, line_height: 15, color_bg: "#060807", color_text: "#f2efe6", color_muted: "#9aa39d", gold: "#d4af37", emerald: "#34d399", intro_bg: "#060807",
  card_style: "glass", radius: 16, grid_columns: "auto", bg_style: "solid", layout_width: "normal", section_gap: 40, hero_align: "center", dock_position: "bottom",
  intro_style: "fade", mood_layout: "masonry", mood_frame: "none", mood_hover: "zoom", blog_layout: "cards", post_template: "classic", gallery_transition: "fade",
};
export const TEMPLATES: Record<string, { note: string; v: Partial<Settings> }> = {
  "Luxury Black & Gold": { note: "The original look", v: { ...DESIGN_BASE, bg_style: "glow" } },
  "Midnight Executive": { note: "Navy, silver, clean", v: { ...DESIGN_BASE, font_heading: "Playfair Display", font_body: "Source Sans 3", color_bg: "#070b16", intro_bg: "#070b16", color_text: "#e8ecf5", color_muted: "#8f9ab3", gold: "#c0c8d8", emerald: "#60a5fa", card_style: "solid", radius: 10, bg_style: "gradient", grid_columns: "3", intro_style: "rise" } },
  "Royal Purple": { note: "Purple and gold glow", v: { ...DESIGN_BASE, font_heading: "Cinzel", font_body: "Poppins", heading_track: 4, color_bg: "#0d0714", intro_bg: "#0d0714", color_text: "#f3ecfa", color_muted: "#a596b8", gold: "#e0b84c", emerald: "#c084fc", radius: 22, bg_style: "glow", intro_style: "zoom", mood_frame: "border" } },
  "Neon Cyber": { note: "Sharp, bright, futuristic", v: { ...DESIGN_BASE, font_heading: "Orbitron", font_body: "Space Grotesk", heading_upper: true, heading_track: 6, color_bg: "#05050f", intro_bg: "#05050f", color_text: "#e6f7ff", color_muted: "#7f9bb0", gold: "#00e5ff", emerald: "#ff2bd6", card_style: "outline", radius: 4, bg_style: "dots", intro_style: "typewriter", gallery_transition: "zoom" } },
  "Clean Paper": { note: "Light, calm, readable", v: { ...DESIGN_BASE, font_heading: "Lora", font_body: "DM Sans", color_bg: "#f7f4ec", intro_bg: "#f7f4ec", color_text: "#1a1d1b", color_muted: "#5b645f", gold: "#8a6d12", emerald: "#047857", card_style: "solid", radius: 14, layout_width: "narrow", intro_style: "blur", post_template: "centered" } },
  "Forest & Cream": { note: "Deep green, warm cream", v: { ...DESIGN_BASE, font_heading: "Merriweather", font_body: "Nunito", color_bg: "#06140e", intro_bg: "#06140e", color_text: "#f6f1e4", color_muted: "#9bb0a4", gold: "#e6c872", emerald: "#4ade80", card_style: "solid", radius: 18, bg_style: "gradient", mood_frame: "polaroid" } },
  "Sunset Orange": { note: "Warm charcoal and orange", v: { ...DESIGN_BASE, font_heading: "Bebas Neue", font_body: "Montserrat", heading_track: 3, color_bg: "#0f0f10", intro_bg: "#0f0f10", color_text: "#f4f1ec", color_muted: "#a29d96", gold: "#fb923c", emerald: "#fbbf24", radius: 8, grid_columns: "3", intro_style: "rise", blog_layout: "magazine" } },
  "Editorial": { note: "Magazine style, wide and airy", v: { ...DESIGN_BASE, font_heading: "DM Serif Display", font_body: "Lato", color_bg: "#0b0b0c", intro_bg: "#0b0b0c", color_text: "#f1efe9", color_muted: "#9c9a93", gold: "#e7d3a5", emerald: "#8bd3c7", card_style: "outline", radius: 2, layout_width: "wide", section_gap: 64, hero_align: "left", grid_columns: "2", intro_style: "fade", post_template: "editorial", blog_layout: "magazine" } },
};
export const DESIGN_KEYS = Object.keys(DESIGN_BASE) as (keyof Settings)[];

// ----- helpers -----
const ALLOW_EMPTY = new Set(["google_verification", "intro_line1", "intro_title", "intro_tagline", "watermark_text", "custom_css", "tagline_ta", "hero_intro_ta", "footer_text_ta", "about_title_ta", "about_body_ta", "contact_intro", "contact_intro_ta", "whatsapp_number", "whatsapp_message", "home_text_title", "home_text_body", "mood_intro", "blog_intro", "ga_id", "bing_verification", "gallery_albums"]);
const num = (v: unknown, min: number, max: number, d: number) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
const pick = <T extends string>(v: unknown, opts: readonly T[], d: T): T => (opts.includes(v as T) ? (v as T) : d);
export const safeColor = (c: unknown, fallback: string) => (typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c) ? c : fallback);
export const siteBase = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, "");
export const list = (s: string) => String(s ?? "").split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
export const cleanVerification = (s: string) => String(s ?? "").replace(/^\s*google-site-verification\s*=\s*/i, "").replace(/["'<>\s]/g, "");
export const albumList = (s: string) => { const a = list(s); return a.length ? a.slice(0, 12) : list(DEFAULTS.gallery_albums); };

export function parseNav(s: string): { label: string; labelTa?: string; href: string }[] {
  return String(s ?? "").split("\n").map((l) => l.split("|").map((x) => x.trim()))
    .filter(([a, b]) => a && b && /^(\/|https?:\/\/)/.test(b))
    .map(([label, href, ta]) => ({ label, href, labelTa: ta || NAV_TA[href] }))
    .slice(0, 8);
}
export function parseSections(s: string): (typeof SECTION_KEYS)[number][] {
  const out = String(s ?? "").split(",").map((x) => x.trim()).filter((x): x is (typeof SECTION_KEYS)[number] => (SECTION_KEYS as readonly string[]).includes(x));
  const uniq = Array.from(new Set(out));
  return uniq.length ? uniq : ["hero", "ring", "grid"];
}
export const fontsHref = (h: string, b: string, t: string = "Noto Sans Tamil") => {
  const names = Array.from(new Set([pick(h, FW, "Cormorant Garamond"), pick(b, FONT_BODIES, "Inter"), pick(t, TAMIL_FONTS, "Noto Sans Tamil"), "Amiri"]));
  const fam = (f: string) => `family=${f.replace(/ /g, "+")}${SINGLE_WEIGHT.has(f) ? "" : ":wght@400;700"}`;
  return `https://fonts.googleapis.com/css2?${names.map(fam).join("&")}&display=swap`;
};
export function themeVars(s: Settings): Record<string, string> {
  const card = s.card_style === "solid" ? "color-mix(in srgb, var(--fg) 9%, var(--bg))" : s.card_style === "outline" ? "transparent" : "rgba(255,255,255,.05)";
  const bgImage = s.bg_style === "glow" ? "radial-gradient(1000px 520px at 50% -8%, color-mix(in srgb, var(--em) 16%, transparent), transparent)"
    : s.bg_style === "gradient" ? "linear-gradient(160deg, var(--bg), color-mix(in srgb, var(--em) 14%, var(--bg)))"
    : s.bg_style === "dots" ? "radial-gradient(color-mix(in srgb, var(--fg) 13%, transparent) 1px, transparent 1px)" : "none";
  return {
    "--bg": s.color_bg, "--fg": s.color_text, "--muted": s.color_muted, "--gold": s.gold, "--em": s.emerald, "--card": card, "--radius": `${s.radius}px`,
    "--font-heading": `"${s.font_heading}"`, "--font-body": `"${s.font_body}"`, "--font-tamil": `"${s.tamil_font}"`,
    "--h-weight": s.heading_weight === "bold" ? "700" : "400", "--h-style": s.heading_italic ? "italic" : "normal", "--h-case": s.heading_upper ? "uppercase" : "none",
    "--h-track": `${(s.heading_track / 100).toFixed(2)}em`, "--base": `${s.base_size}px`, "--lh": String(s.line_height / 10), "--gap": `${s.section_gap}px`,
    "--bg-image": bgImage, "--bg-size": s.bg_style === "dots" ? "22px 22px" : "auto", "--content-w": s.layout_width === "narrow" ? "56rem" : s.layout_width === "wide" ? "90rem" : "72rem",
  };
}
export const themeStyle = (s: Settings) => themeVars(s) as unknown as CSSProperties;

function cleanBlocks(v: unknown): AboutBlock[] {
  if (!Array.isArray(v)) return [];
  const types = ["heading", "text", "list", "quote", "divider"] as const;
  return v.slice(0, 60).map((b) => ({ type: pick((b as AboutBlock)?.type, types, "text"), en: String((b as AboutBlock)?.en ?? "").slice(0, 3000), ta: String((b as AboutBlock)?.ta ?? "").slice(0, 3000) }));
}
function cleanSeo(v: unknown): PageSeo {
  const out: PageSeo = {};
  if (v && typeof v === "object") for (const p of ["/about", "/gallery", "/moodboard", "/blog", "/contact"]) {
    const e = (v as PageSeo)[p];
    if (e && (e.title || e.description)) out[p] = { title: String(e.title ?? "").slice(0, 120), description: String(e.description ?? "").slice(0, 300) };
  }
  return out;
}

function sanitize(s: Settings): Settings {
  const d = DEFAULTS;
  const r: Record<string, unknown> = { ...s };
  for (const [k, opts] of Object.entries(ENUMS)) r[k] = pick(r[k], opts as readonly string[], String((d as unknown as Record<string, unknown>)[k]));
  return {
    ...(r as unknown as Settings),
    font_heading: pick(s.font_heading, FW, d.font_heading), font_body: pick(s.font_body, FONT_BODIES, d.font_body), tamil_font: pick(s.tamil_font, TAMIL_FONTS, d.tamil_font),
    color_bg: safeColor(s.color_bg, d.color_bg), color_text: safeColor(s.color_text, d.color_text), color_muted: safeColor(s.color_muted, d.color_muted),
    gold: safeColor(s.gold, d.gold), emerald: safeColor(s.emerald, d.emerald), intro_bg: safeColor(s.intro_bg, d.intro_bg),
    card_style: pick(s.card_style, CARD_STYLES, d.card_style), grid_columns: pick(String(s.grid_columns), GRID_COLUMNS, d.grid_columns),
    dock_position: pick(s.dock_position, DOCK_POSITIONS, d.dock_position),
    radius: num(s.radius, 0, 40, d.radius), ring_height: num(s.ring_height, 200, 600, d.ring_height),
    intro_seconds: num(s.intro_seconds, 3, 15, d.intro_seconds), gallery_seconds: num(s.gallery_seconds, 3, 20, d.gallery_seconds),
    watermark_opacity: num(s.watermark_opacity, 0, 60, d.watermark_opacity),
    heading_track: num(s.heading_track, 0, 20, 0), base_size: num(s.base_size, 14, 20, 16), line_height: num(s.line_height, 13, 22, 15), section_gap: num(s.section_gap, 0, 120, 40),
    home_posts_count: num(s.home_posts_count, 1, 6, 3), home_gallery_count: num(s.home_gallery_count, 2, 12, 6),
    gallery_overlay: num(s.gallery_overlay, 0, 100, 100), mood_columns: num(s.mood_columns, 1, 6, 4), mood_gap: num(s.mood_gap, 0, 40, 12), mood_radius: num(s.mood_radius, 0, 40, 12),
    blog_columns: num(s.blog_columns, 1, 2, 1), post_size: num(s.post_size, 15, 24, 17),
    sections: parseSections(s.sections).join(","), google_verification: cleanVerification(s.google_verification),
    show_intro: s.show_intro !== false, show_ring: s.show_ring !== false, show_theme_toggle: s.show_theme_toggle !== false,
    gallery_zoom: s.gallery_zoom !== false, intro_every_visit: s.intro_every_visit === true,
    gallery_caption: s.gallery_caption !== false, gallery_autoplay: s.gallery_autoplay !== false, gallery_arrows: s.gallery_arrows !== false, mood_shuffle: s.mood_shuffle === true,
    blog_show_meta: s.blog_show_meta !== false, blog_show_excerpt: s.blog_show_excerpt !== false, post_show_share: s.post_show_share !== false,
    post_show_subscribe: s.post_show_subscribe !== false, post_show_time: s.post_show_time !== false, robots_index: s.robots_index !== false,
    heading_italic: s.heading_italic === true, heading_upper: s.heading_upper === true,
    show_whatsapp_float: s.show_whatsapp_float !== false, show_lang_toggle: s.show_lang_toggle !== false,
    whatsapp_number: (() => { const x = String(s.whatsapp_number ?? "").replace(/\D/g, ""); return x.length >= 8 && x.length <= 15 ? x : ""; })(),
    ga_id: /^G-[A-Za-z0-9]{6,14}$/.test(String(s.ga_id ?? "").trim()) ? String(s.ga_id).trim() : "",
    bing_verification: String(s.bing_verification ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 80),
    about_blocks: cleanBlocks(s.about_blocks), page_seo: cleanSeo(s.page_seo),
  };
}

export async function getSettings(): Promise<Settings> {
  try {
    const { data } = await supabase.from("settings").select("data").eq("id", 1).single();
    const saved = (data?.data ?? {}) as Record<string, unknown>;
    const out: Record<string, unknown> = { ...DEFAULTS };
    for (const [k, v] of Object.entries(saved)) if (k in DEFAULTS && v != null && (v !== "" || ALLOW_EMPTY.has(k))) out[k] = v;
    return sanitize(out as unknown as Settings);
  } catch {
    return DEFAULTS;
  }
}

// ----- Rules for changes made by the AI helper (only these settings, only valid values) -----
type Spec = { t: "str"; max: number } | { t: "color" } | { t: "num"; min: number; max: number } | { t: "bool" } | { t: "enum"; opts: readonly string[] };
const str = (max: number): Spec => ({ t: "str", max });
export const SPEC: Partial<Record<keyof Settings, Spec>> = {
  site_name: str(60), tagline: str(120), hero_intro: str(400), footer_text: str(200),
  tagline_ta: str(120), hero_intro_ta: str(400), about_title: str(120), about_body: str(4000), job_title: str(120),
  seo_title: str(120), seo_description: str(300), seo_keywords: str(500),
  font_heading: { t: "enum", opts: FONT_HEADINGS }, font_body: { t: "enum", opts: FONT_BODIES },
  color_bg: { t: "color" }, color_text: { t: "color" }, color_muted: { t: "color" }, gold: { t: "color" }, emerald: { t: "color" }, intro_bg: { t: "color" },
  card_style: { t: "enum", opts: CARD_STYLES }, radius: { t: "num", min: 0, max: 40 }, grid_columns: { t: "enum", opts: GRID_COLUMNS },
  sections: str(100), show_ring: { t: "bool" }, ring_height: { t: "num", min: 200, max: 600 },
  dock_position: { t: "enum", opts: DOCK_POSITIONS }, dock_links: str(600), show_theme_toggle: { t: "bool" }, show_lang_toggle: { t: "bool" },
  show_intro: { t: "bool" }, intro_line1: str(200), intro_title: str(80), intro_tagline: str(120), intro_seconds: { t: "num", min: 3, max: 15 }, intro_every_visit: { t: "bool" },
  gallery_seconds: { t: "num", min: 3, max: 20 }, gallery_zoom: { t: "bool" }, watermark_text: str(80), watermark_opacity: { t: "num", min: 0, max: 40 },
  tamil_font: { t: "enum", opts: TAMIL_FONTS }, heading_weight: { t: "enum", opts: ENUMS.heading_weight }, heading_italic: { t: "bool" }, heading_upper: { t: "bool" },
  heading_track: { t: "num", min: 0, max: 20 }, base_size: { t: "num", min: 14, max: 20 }, line_height: { t: "num", min: 13, max: 22 },
  bg_style: { t: "enum", opts: ENUMS.bg_style }, layout_width: { t: "enum", opts: ENUMS.layout_width }, section_gap: { t: "num", min: 0, max: 120 }, hero_align: { t: "enum", opts: ENUMS.hero_align },
  intro_style: { t: "enum", opts: ENUMS.intro_style }, gallery_layout: { t: "enum", opts: ENUMS.gallery_layout }, gallery_transition: { t: "enum", opts: ENUMS.gallery_transition },
  gallery_overlay: { t: "num", min: 0, max: 100 }, gallery_caption: { t: "bool" }, gallery_autoplay: { t: "bool" }, gallery_arrows: { t: "bool" }, gallery_whole_bg: { t: "enum", opts: ENUMS.gallery_whole_bg },
  mood_title: str(80), mood_intro: str(300), mood_layout: { t: "enum", opts: ENUMS.mood_layout }, mood_columns: { t: "num", min: 1, max: 6 }, mood_gap: { t: "num", min: 0, max: 40 }, mood_radius: { t: "num", min: 0, max: 40 },
  mood_hover: { t: "enum", opts: ENUMS.mood_hover }, mood_caption: { t: "enum", opts: ENUMS.mood_caption }, mood_frame: { t: "enum", opts: ENUMS.mood_frame }, mood_shuffle: { t: "bool" },
  blog_title: str(80), blog_intro: str(300), blog_layout: { t: "enum", opts: ENUMS.blog_layout }, blog_columns: { t: "num", min: 1, max: 2 }, blog_show_meta: { t: "bool" }, blog_show_excerpt: { t: "bool" },
  post_template: { t: "enum", opts: ENUMS.post_template }, post_size: { t: "num", min: 15, max: 24 }, post_width: { t: "enum", opts: ENUMS.post_width },
  post_show_share: { t: "bool" }, post_show_subscribe: { t: "bool" }, post_show_time: { t: "bool" }, about_layout: { t: "enum", opts: ENUMS.about_layout },
  home_text_title: str(120), home_text_body: str(1500), home_posts_count: { t: "num", min: 1, max: 6 }, home_gallery_count: { t: "num", min: 2, max: 12 },
};

export const describeSpec = () => Object.entries(SPEC).map(([k, sp]) => {
  const s = sp as Spec;
  return `${k}: ${s.t === "str" ? `text (max ${s.max})` : s.t === "color" ? "color #rrggbb" : s.t === "num" ? `number ${s.min}-${s.max}` : s.t === "bool" ? "true/false" : `one of ${s.opts.join(" | ")}`}`;
}).join("\n");

export function applyPatch(patch: Record<string, unknown>): { changes: Partial<Settings>; rejected: string[] } {
  const changes: Record<string, unknown> = {}; const rejected: string[] = [];
  for (const [k, v] of Object.entries(patch ?? {})) {
    const sp = SPEC[k as keyof Settings] as Spec | undefined;
    if (!sp) { rejected.push(k); continue; }
    if (sp.t === "str" && typeof v === "string") changes[k] = v.slice(0, sp.max);
    else if (sp.t === "color" && typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v)) changes[k] = v.toLowerCase();
    else if (sp.t === "num" && Number.isFinite(Number(v))) changes[k] = Math.min(sp.max, Math.max(sp.min, Math.round(Number(v))));
    else if (sp.t === "bool" && typeof v === "boolean") changes[k] = v;
    else if (sp.t === "enum" && sp.opts.includes(String(v))) changes[k] = String(v);
    else rejected.push(k);
  }
  return { changes: changes as Partial<Settings>, rejected };
}
