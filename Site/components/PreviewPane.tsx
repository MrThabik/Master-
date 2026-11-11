"use client";
import { useEffect, useRef, useState } from "react";
import { fontsHref, Settings, themeVars } from "@/lib/settings";

const PAGES: [string, string][] = [["/", "Home"], ["/gallery", "Gallery"], ["/moodboard", "Mood-board"], ["/blog", "Blog"], ["/about", "About"], ["/contact", "Contact"]];
const DEVICES: [string, number][] = [["Phone", 390], ["Tablet", 820], ["Laptop", 1280]];

// Your real website inside the editor. Colours, fonts and custom CSS update live; text changes appear after you save.
export default function PreviewPane({ v, savedAt }: { v: Settings; savedAt: number }) {
  const [path, setPath] = useState("/");
  const [dev, setDev] = useState(390);
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(0);
  const [ready, setReady] = useState(0);
  const [w, setW] = useState(420);
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const sig = JSON.stringify(themeVars(v)) + v.font_heading + v.font_body + v.custom_css;

  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: "admin-theme", vars: themeVars(v), fonts: fontsHref(v.font_heading, v.font_body), css: v.custom_css }, location.origin);
  }, [sig, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const on = (e: MessageEvent) => { if (e.origin === location.origin && e.data?.type === "preview-ready") setReady((n) => n + 1); };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, []);
  useEffect(() => { if (savedAt) setKey((k) => k + 1); }, [savedAt]);
  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(() => setW(box.current?.clientWidth || 420));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [show]);

  const scale = Math.min(1, w / dev);
  const H = 620;
  const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-xs ${on ? "bg-gold text-black border-gold" : "bd-gold-40 text-gold"}`;
  return (
    <section className="bd-gold-25 r-card border bg-card p-3" data-tour="preview">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-serif text-xl text-gold">Live preview</h2>
        <button className="bd-gold-40 rounded-full border px-3 py-1.5 text-xs text-gold xl:hidden" onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"} preview</button>
      </div>
      <div className={`${show ? "block" : "hidden"} xl:block`}>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PAGES.map(([p, label]) => <button key={p} className={chip(path === p)} onClick={() => setPath(p)}>{label}</button>)}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {DEVICES.map(([label, px]) => <button key={label} className={chip(dev === px)} onClick={() => setDev(px)}>{label}</button>)}
          <button className="bd-gold-40 rounded-full border px-3 py-1.5 text-xs text-gold" onClick={() => setKey((k) => k + 1)}>Reload</button>
          <a className="bd-gold-40 rounded-full border px-3 py-1.5 text-xs text-em" href={path} target="_blank" rel="noopener">Open ↗</a>
        </div>
        <div ref={box} className="bd-gold-30 mt-3 w-full overflow-hidden rounded-xl border" style={{ height: H }}>
          <iframe key={key + path} ref={frame} src={path} title="Website preview" onLoad={() => setReady((n) => n + 1)}
            style={{ width: dev, height: H / scale, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0, background: "#000" }} />
        </div>
        <p className="mt-2 text-xs text-muted">Colours, fonts and custom CSS change here as you edit. Text changes show after you press Save.</p>
      </div>
    </section>
  );
}
