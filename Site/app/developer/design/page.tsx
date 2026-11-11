"use client";
import { useEffect, useState } from "react";
import Gate from "@/components/Gate";
import SaveBar from "@/components/SaveBar";
import PreviewPane from "@/components/PreviewPane";
import AiHelper from "@/components/AiHelper";
import TemplatePicker from "@/components/TemplatePicker";
import SectionBuilder from "@/components/SectionBuilder";
import Intro from "@/components/Intro";
import { Tips } from "@/components/Tour";
import { useSettings } from "@/hooks/useSettings";
import { CARD_STYLES, DOCK_POSITIONS, FONT_BODIES, FONT_HEADINGS, GRID_COLUMNS, TAMIL_FONTS, fontsHref, parseNav, type Settings } from "@/lib/settings";

const inp = "w-full rounded-lg border bd-gold-30 bg-field p-2.5 text-base text-fg sm:text-sm";
const chk = "flex items-center gap-3 text-sm text-fg";

function Box({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`bd-gold-25 grid content-start gap-3 rounded-xl border p-4 ${wide ? "2xl:col-span-2" : ""}`}>
      <h2 className="font-serif text-2xl text-gold">{title}</h2>
      {children}
    </section>
  );
}
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="grid gap-1 text-sm text-muted"><span>{label}</span>{children}</label>
);

function Editor() {
  const { v, set, patch, save, undo, redo, canUndo, canRedo, dirty, msg, savedAt } = useSettings();
  const [playIntro, setPlayIntro] = useState(false);
  const T = <K extends keyof Settings>(k: K) => (e: { target: { value: string } }) => set(k, e.target.value as Settings[K]);
  const N = <K extends keyof Settings>(k: K) => (e: { target: { value: string } }) => set(k, Number(e.target.value) as Settings[K]);
  const C = <K extends keyof Settings>(k: K) => (e: { target: { checked: boolean } }) => set(k, e.target.checked as Settings[K]);
  const sel = <K extends keyof Settings>(k: K, opts: readonly (readonly [string, string])[]) => (
    <select className={inp} value={String(v[k])} onChange={T(k)}>{opts.map(([val, label]) => <option key={val} value={val}>{label}</option>)}</select>
  );
  const range = <K extends keyof Settings>(k: K, label: string, min: number, max: number, unit = "", step = 1) => (
    <Field label={`${label}: ${v[k]}${unit}`}><input type="range" min={min} max={max} step={step} value={Number(v[k])} onChange={N(k)} className="h-8 w-full" /></Field>
  );
  const color = (k: "color_bg" | "color_text" | "color_muted" | "gold" | "emerald" | "intro_bg", label: string) => (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" className="h-11 w-16 rounded bg-field" value={v[k]} onChange={T(k)} />
        <input className={inp} value={v[k]} onChange={T(k)} autoCapitalize="none" spellCheck={false} />
      </div>
    </Field>
  );

  useEffect(() => {
    let l = document.getElementById("pv-fonts") as HTMLLinkElement | null;
    if (!l) { l = document.createElement("link"); l.id = "pv-fonts"; l.rel = "stylesheet"; document.head.appendChild(l); }
    l.href = fontsHref(v.font_heading, v.font_body, v.tamil_font);
  }, [v.font_heading, v.font_body, v.tamil_font]);

  const sections = v.sections.split(",");
  return (
    <div>
      <h1 className="font-serif text-3xl text-gold">Design &amp; Layout</h1>
      <p className="mt-1 text-sm text-muted">Change how the whole website looks. Check the live preview, then press <b>Save changes</b>.</p>
      <div className="mt-4"><Tips id="design" items={["Start with a template: one tap sets colours, fonts, shapes and layout. Then fine-tune below.", "The live preview shows your real website: colours, fonts and text style change as you edit.", "Home page sections can be dragged (or moved with the arrows), removed and added.", "Describe a change to the AI helper, for example “use a bold modern heading font”.", "Nothing is public until you press Save changes. Undo and Redo are in the bottom bar, and History keeps earlier versions."]} /></div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="grid content-start gap-5 2xl:grid-cols-2">
          <Box title="Templates (one tap)" wide><TemplatePicker onApply={patch} /></Box>

          <Box title="Colours">
            {color("color_bg", "Background")}
            {color("color_text", "Main text")}
            {color("color_muted", "Soft text")}
            {color("gold", "Main accent")}
            {color("emerald", "Second accent")}
            <Field label="Background style">{sel("bg_style", [["solid", "Plain colour"], ["glow", "Soft glow at the top"], ["gradient", "Diagonal gradient"], ["dots", "Dotted pattern"]])}</Field>
            <p className="text-xs text-muted">These apply to the dark look. The Light button in the dock keeps its own light colours.</p>
          </Box>

          <Box title="Fonts and text style">
            <Field label="Heading font"><select className={inp} value={v.font_heading} onChange={T("font_heading")}>{FONT_HEADINGS.map((f) => <option key={f}>{f}</option>)}</select></Field>
            <Field label="Text font"><select className={inp} value={v.font_body} onChange={T("font_body")}>{FONT_BODIES.map((f) => <option key={f}>{f}</option>)}</select></Field>
            <Field label="Tamil font"><select className={inp} value={v.tamil_font} onChange={T("tamil_font")}>{TAMIL_FONTS.map((f) => <option key={f}>{f}</option>)}</select></Field>
            <Field label="Heading weight">{sel("heading_weight", [["normal", "Regular"], ["bold", "Bold"]])}</Field>
            <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.heading_italic} onChange={C("heading_italic")} /> Italic headings</label>
            <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.heading_upper} onChange={C("heading_upper")} /> CAPITAL LETTER headings</label>
            {range("heading_track", "Heading letter spacing", 0, 20, "")}
            {range("base_size", "Text size", 14, 20, "px")}
            {range("line_height", "Line spacing (tenths)", 13, 22, "")}
            <p className="rounded-lg p-3 text-center text-3xl text-gold" style={{ fontFamily: `"${v.font_heading}", serif`, fontWeight: v.heading_weight === "bold" ? 700 : 400, fontStyle: v.heading_italic ? "italic" : "normal", textTransform: v.heading_upper ? "uppercase" : "none", letterSpacing: `${v.heading_track / 100}em` }}>Thaseen Shabik N</p>
          </Box>

          <Box title="Cards, shapes and page width">
            <Field label="Card style">{sel("card_style", CARD_STYLES.map((f) => [f, f === "glass" ? "Glass (see-through)" : f === "solid" ? "Solid" : "Outline only"] as const))}</Field>
            {range("radius", "Corner roundness", 0, 40, "px")}
            <Field label="Cards per row (large screens)">{sel("grid_columns", GRID_COLUMNS.map((f) => [f, f === "auto" ? "Automatic" : f] as const))}</Field>
            <Field label="Page width">{sel("layout_width", [["narrow", "Narrow"], ["normal", "Normal"], ["wide", "Wide"]])}</Field>
            {range("section_gap", "Space between sections", 0, 120, "px", 4)}
            <Field label="Title alignment">{sel("hero_align", [["center", "Centered"], ["left", "Left"]])}</Field>
          </Box>

          <Box title="Home page sections" wide>
            <p className="text-sm text-muted">Drag the handle ⠿ (laptop) or use the arrows (phone). Remove what you don’t want, add what you do.</p>
            <SectionBuilder value={v.sections} onChange={(csv) => set("sections", csv)} />
            <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.show_ring} onChange={C("show_ring")} /> Show the 3D rotating cards (needs the “3D rotating cards” section)</label>
            {range("ring_height", "3D cards height", 220, 560, "px", 10)}
            {sections.includes("posts") && range("home_posts_count", "Blog posts shown", 1, 6)}
            {sections.includes("gallery") && range("home_gallery_count", "Photos shown in the strip", 2, 12)}
            {sections.includes("text") && (
              <>
                <Field label="Your own text block: title"><input className={inp} value={v.home_text_title} onChange={T("home_text_title")} /></Field>
                <Field label="Your own text block: text"><textarea className={`${inp} min-h-[100px]`} value={v.home_text_body} onChange={T("home_text_body")} /></Field>
              </>
            )}
          </Box>

          <Box title="Navigation dock">
            <Field label="Position">{sel("dock_position", DOCK_POSITIONS.map((f) => [f, f === "bottom" ? "Bottom" : f === "top" ? "Top" : "Hidden"] as const))}</Field>
            <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.show_theme_toggle} onChange={C("show_theme_toggle")} /> Show the Dark / Light button</label>
            <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.show_lang_toggle} onChange={C("show_lang_toggle")} /> Show the Tamil / English language button</label>
            <Field label="Links, one per line as Name|/address|Tamil name (Tamil name is optional, up to 8 links)">
              <textarea className={`${inp} min-h-[130px] font-mono`} value={v.dock_links} onChange={T("dock_links")} autoCapitalize="none" spellCheck={false} />
            </Field>
            <p className="text-xs text-muted">Pages: / (home), /gallery, /moodboard, /blog, /about, /contact. A full https link opens in a new tab. Now {parseNav(v.dock_links).length} links.</p>
          </Box>

          <Box title="Opening intro">
            <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.show_intro} onChange={C("show_intro")} /> Play the intro</label>
            <Field label="Animation style">{sel("intro_style", [["fade", "Fade"], ["rise", "Rise up"], ["zoom", "Zoom in"], ["blur", "Focus in"], ["typewriter", "Typewriter"]])}</Field>
            <Field label="First line (leave empty to skip it)"><input className={inp} dir="auto" value={v.intro_line1} onChange={T("intro_line1")} /></Field>
            <Field label="Title (empty = website name)"><input className={inp} value={v.intro_title} onChange={T("intro_title")} /></Field>
            <Field label="Tagline (empty = main tagline)"><input className={inp} value={v.intro_tagline} onChange={T("intro_tagline")} /></Field>
            {range("intro_seconds", "Length", 3, 12, " seconds")}
            {color("intro_bg", "Intro background")}
            <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.intro_every_visit} onChange={C("intro_every_visit")} /> Play on every page load (otherwise once per visit)</label>
            <button className="border-em w-fit rounded-full border px-5 py-3 text-sm text-em" onClick={() => setPlayIntro(true)}>▶ Preview the intro</button>
          </Box>

          <Box title="Custom CSS (advanced)" wide>
            <p className="text-xs text-muted">Optional, only for people who know CSS. Empty this box and save to undo.</p>
            <textarea className={`${inp} min-h-[140px] font-mono`} value={v.custom_css} onChange={T("custom_css")} autoCapitalize="none" spellCheck={false} placeholder="h1 { letter-spacing: .05em; }" />
          </Box>
        </div>
        <aside className="grid content-start gap-5">
          <PreviewPane v={v} savedAt={savedAt} />
          <AiHelper values={v} onApply={patch} />
        </aside>
      </div>
      <SaveBar dirty={dirty} msg={msg} onSave={save} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
      {playIntro && <Intro line1={v.intro_line1} title={v.intro_title || v.site_name} tagline={v.intro_tagline || v.tagline} seconds={v.intro_seconds} everyVisit bg={v.intro_bg} style={v.intro_style} preview onDone={() => setPlayIntro(false)} />}
    </div>
  );
}

export default function Page() { return <Gate><Editor /></Gate>; }
