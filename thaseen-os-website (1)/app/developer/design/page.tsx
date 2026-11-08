"use client";
import { useEffect } from "react";
import Gate from "@/components/Gate";
import SaveBar from "@/components/SaveBar";
import { useSettings } from "@/hooks/useSettings";
import { CARD_STYLES, DOCK_POSITIONS, FONT_BODIES, FONT_HEADINGS, GRID_COLUMNS, PRESETS, fontsHref, parseNav, parseSections, themeStyle, type Settings } from "@/lib/settings";

const inp = "w-full rounded-lg border bd-gold-30 bg-field p-2.5 text-base text-fg sm:text-sm";
const chip = "bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold";
const LABEL: Record<string, string> = { hero: "Title and intro text", ring: "3D rotating cards", grid: "Website cards" };

function Box({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`bd-gold-25 grid content-start gap-3 rounded-xl border p-4 ${wide ? "xl:col-span-2" : ""}`}>
      <h2 className="font-serif text-2xl text-gold">{title}</h2>
      {children}
    </section>
  );
}
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="grid gap-1 text-sm text-muted"><span>{label}</span>{children}</label>
);

function Editor() {
  const { v, set, save, dirty, msg } = useSettings();
  const T = <K extends keyof Settings>(k: K) => (e: { target: { value: string } }) => set(k, e.target.value as Settings[K]);
  const N = <K extends keyof Settings>(k: K) => (e: { target: { value: string } }) => set(k, Number(e.target.value) as Settings[K]);
  const C = <K extends keyof Settings>(k: K) => (e: { target: { checked: boolean } }) => set(k, e.target.checked as Settings[K]);
  const order = parseSections(v.sections);
  const move = (i: number, d: number) => {
    const a = [...order]; if (!a[i + d]) return;
    [a[i], a[i + d]] = [a[i + d], a[i]];
    set("sections", a.join(","));
  };

  // load the chosen fonts so the preview shows them
  useEffect(() => {
    let l = document.getElementById("pv-fonts") as HTMLLinkElement | null;
    if (!l) { l = document.createElement("link"); l.id = "pv-fonts"; l.rel = "stylesheet"; document.head.appendChild(l); }
    l.href = fontsHref(v.font_heading, v.font_body);
  }, [v.font_heading, v.font_body]);

  const color = (k: "color_bg" | "color_text" | "color_muted" | "gold" | "emerald" | "intro_bg", label: string) => (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" className="h-11 w-16 rounded bg-field" value={v[k]} onChange={T(k)} />
        <input className={inp} value={v[k]} onChange={T(k)} autoCapitalize="none" spellCheck={false} />
      </div>
    </Field>
  );

  return (
    <div>
      <h1 className="font-serif text-3xl text-gold">Design &amp; Layout</h1>
      <p className="mt-1 text-sm text-muted">Change how the whole website looks. Check the preview, then press <b>Save changes</b>.</p>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Box title="Live preview" wide>
          <div style={{ ...themeStyle(v), background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-body)" }} className="bd-gold-30 overflow-hidden rounded-xl border p-5">
            <p className="text-center text-xs uppercase tracking-[.3em] text-gold">{v.tagline}</p>
            <h3 className="bg-gradient-to-r from-[var(--gold)] via-[var(--fg)] to-[var(--em)] bg-clip-text text-center font-serif text-4xl text-transparent sm:text-5xl">{v.site_name}</h3>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted">{v.hero_intro}</p>
            <div className="mx-auto mt-5 max-w-sm">
              <article className="r-card bd-gold overflow-hidden bg-card">
                <div className="grid aspect-[16/10] place-items-center font-serif text-xl text-gold" style={{ background: "color-mix(in srgb, var(--em) 14%, var(--bg))" }}>sample.website.in</div>
                <div className="p-4">
                  <h4 className="font-serif text-xl text-gold">Sample website</h4>
                  <p className="my-2 text-sm text-muted">A short description of the website appears here.</p>
                  <span className="border-em inline-block rounded-full border px-4 py-2 text-sm text-em">Visit website</span>
                </div>
              </article>
            </div>
          </div>
        </Box>

        <Box title="Colours">
          <Field label="Ready-made colour sets">
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRESETS).map(([name, p]) => (
                <button key={name} className={chip} onClick={() => (Object.keys(p) as (keyof typeof p)[]).forEach((k) => set(k, p[k]))}>{name}</button>
              ))}
            </div>
          </Field>
          {color("color_bg", "Background")}
          {color("color_text", "Main text")}
          {color("color_muted", "Soft text")}
          {color("gold", "Main accent")}
          {color("emerald", "Second accent")}
          <p className="text-xs text-muted">These apply to the dark look. The Light button in the dock keeps its own light colours.</p>
        </Box>

        <Box title="Fonts and shapes">
          <Field label="Heading font">
            <select className={inp} value={v.font_heading} onChange={T("font_heading")}>{FONT_HEADINGS.map((f) => <option key={f}>{f}</option>)}</select>
          </Field>
          <Field label="Text font">
            <select className={inp} value={v.font_body} onChange={T("font_body")}>{FONT_BODIES.map((f) => <option key={f}>{f}</option>)}</select>
          </Field>
          <Field label="Card style">
            <select className={inp} value={v.card_style} onChange={T("card_style")}>{CARD_STYLES.map((f) => <option key={f} value={f}>{f === "glass" ? "Glass (see-through)" : f === "solid" ? "Solid" : "Outline only"}</option>)}</select>
          </Field>
          <Field label={`Corner roundness: ${v.radius}px`}>
            <input type="range" min={0} max={40} value={v.radius} onChange={N("radius")} className="h-8 w-full" />
          </Field>
          <p className="text-xs text-muted">Tamil text always uses Noto Sans Tamil.</p>
        </Box>

        <Box title="Home page layout">
          <Field label="Order of the home page sections">
            <div className="grid gap-2">
              {order.map((k, i) => (
                <div key={k} className="bd-gold-25 flex items-center gap-2 rounded-lg border p-2">
                  <span className="flex-1 text-sm text-fg">{i + 1}. {LABEL[k]}</span>
                  <button className={chip} onClick={() => move(i, -1)}>↑</button>
                  <button className={chip} onClick={() => move(i, 1)}>↓</button>
                </div>
              ))}
            </div>
          </Field>
          <label className="flex items-center gap-3 text-sm text-fg"><input type="checkbox" className="h-5 w-5" checked={v.show_ring} onChange={C("show_ring")} /> Show the 3D rotating cards</label>
          <Field label={`3D cards height: ${v.ring_height}px`}>
            <input type="range" min={220} max={560} step={10} value={v.ring_height} onChange={N("ring_height")} className="h-8 w-full" />
          </Field>
          <Field label="Website cards per row (on large screens)">
            <select className={inp} value={v.grid_columns} onChange={T("grid_columns")}>{GRID_COLUMNS.map((f) => <option key={f} value={f}>{f === "auto" ? "Automatic" : f}</option>)}</select>
          </Field>
        </Box>

        <Box title="Navigation dock">
          <Field label="Position">
            <select className={inp} value={v.dock_position} onChange={T("dock_position")}>{DOCK_POSITIONS.map((f) => <option key={f} value={f}>{f === "bottom" ? "Bottom" : f === "top" ? "Top" : "Hidden"}</option>)}</select>
          </Field>
          <label className="flex items-center gap-3 text-sm text-fg"><input type="checkbox" className="h-5 w-5" checked={v.show_theme_toggle} onChange={C("show_theme_toggle")} /> Show the Dark / Light button</label>
          <Field label="Links, one per line as Name|/address (up to 8)">
            <textarea className={`${inp} min-h-[130px] font-mono`} value={v.dock_links} onChange={T("dock_links")} autoCapitalize="none" spellCheck={false} />
          </Field>
          <p className="text-xs text-muted">Pages: / (home), /gallery, /moodboard, /blog, /about. A full link such as https://example.com opens in a new tab. Now showing {parseNav(v.dock_links).length} links.</p>
        </Box>

        <Box title="Opening intro">
          <label className="flex items-center gap-3 text-sm text-fg"><input type="checkbox" className="h-5 w-5" checked={v.show_intro} onChange={C("show_intro")} /> Play the intro</label>
          <Field label="First line (leave empty to skip it)"><input className={inp} dir="auto" value={v.intro_line1} onChange={T("intro_line1")} /></Field>
          <Field label="Title (empty = website name)"><input className={inp} value={v.intro_title} onChange={T("intro_title")} /></Field>
          <Field label="Tagline (empty = main tagline)"><input className={inp} value={v.intro_tagline} onChange={T("intro_tagline")} /></Field>
          <Field label={`Length: ${v.intro_seconds} seconds`}><input type="range" min={3} max={12} value={v.intro_seconds} onChange={N("intro_seconds")} className="h-8 w-full" /></Field>
          {color("intro_bg", "Intro background")}
          <label className="flex items-center gap-3 text-sm text-fg"><input type="checkbox" className="h-5 w-5" checked={v.intro_every_visit} onChange={C("intro_every_visit")} /> Play on every page load (otherwise once per visit)</label>
        </Box>

        <Box title="Gallery">
          <Field label={`Seconds per photo: ${v.gallery_seconds}`}><input type="range" min={3} max={20} value={v.gallery_seconds} onChange={N("gallery_seconds")} className="h-8 w-full" /></Field>
          <label className="flex items-center gap-3 text-sm text-fg"><input type="checkbox" className="h-5 w-5" checked={v.gallery_zoom} onChange={C("gallery_zoom")} /> Slow zoom effect</label>
          <Field label="Watermark text (empty = none)"><input className={inp} value={v.watermark_text} onChange={T("watermark_text")} /></Field>
          <Field label={`Watermark strength: ${v.watermark_opacity}%`}><input type="range" min={0} max={40} value={v.watermark_opacity} onChange={N("watermark_opacity")} className="h-8 w-full" /></Field>
        </Box>

        <Box title="Custom CSS (advanced)" wide>
          <p className="text-xs text-muted">Optional. Only for people who know CSS. A mistake here can break how the site looks; empty this box and save to undo.</p>
          <textarea className={`${inp} min-h-[140px] font-mono`} value={v.custom_css} onChange={T("custom_css")} autoCapitalize="none" spellCheck={false} placeholder="h1 { letter-spacing: .05em; }" />
        </Box>
      </div>
      <SaveBar dirty={dirty} msg={msg} onSave={save} />
    </div>
  );
}

export default function Page() { return <Gate><Editor /></Gate>; }
