"use client";
import { useEffect, useLayoutEffect, useState } from "react";

export type Step = { sel?: string; title: string; text: string };

export const SHELL_TOUR: Step[] = [
  { title: "Welcome to Developer Space", text: "This short guide shows where everything is. Close it any time, and start it again with the Guide button." },
  { sel: '[data-tour="menu"], [data-tour="menu-btn"]', title: "The menu", text: "Every manager is here: Websites, Design & Layout, Site Settings, Gallery, Mood-board, Blog, Messages, Subscribers and History." },
  { sel: '[data-tour="design"]', title: "Design & Layout", text: "Change colours, fonts, layout, navigation and the intro. A live preview shows your changes before you save." },
  { sel: '[data-tour="history"]', title: "History", text: "Every save is kept. Open History to go back to an earlier version with one tap." },
  { sel: '[data-tour="voice"]', title: "Voice", text: "Tap the microphone and say things like “open gallery”, “save”, “undo”, or describe a change such as “make the headings bigger”." },
  { sel: '[data-tour="site"]', title: "Your website", text: "Opens your public website in a new tab so you can check how visitors see it." },
  { title: "Tips on every page", text: "Each page has a Tips box at the top. You can hide it, and the Guide button can show this tour again." },
];

const rectOf = (sel?: string) => {
  if (!sel) return null;
  for (const el of Array.from(document.querySelectorAll(sel))) {
    const r = (el as HTMLElement).getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return r;
  }
  return null;
};

export function Tour({ steps, onClose }: { steps: Step[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [r, setR] = useState<DOMRect | null>(null);
  const s = steps[i];
  useLayoutEffect(() => {
    const el = s.sel ? Array.from(document.querySelectorAll(s.sel)).find((e) => (e as HTMLElement).getBoundingClientRect().width > 0) : null;
    (el as HTMLElement | undefined)?.scrollIntoView({ block: "center", behavior: "smooth" });
    const t = setTimeout(() => setR(rectOf(s.sel)), 250);
    setR(rectOf(s.sel));
    return () => clearTimeout(t);
  }, [i, s.sel]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowRight") setI((n) => Math.min(steps.length - 1, n + 1)); if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1)); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose, steps.length]);
  const last = i === steps.length - 1;
  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      {r ? <div className="absolute rounded-xl border-2 border-em transition-all duration-300" style={{ left: r.left - 6, top: r.top - 6, width: r.width + 12, height: r.height + 12, boxShadow: "0 0 0 9999px rgba(0,0,0,.65), 0 0 24px var(--em)" }} /> : <div className="absolute inset-0 bg-black/65" />}
      <div className="bd-gold-40 r-card pointer-events-auto absolute bottom-4 left-1/2 w-[min(92vw,26rem)] -translate-x-1/2 border bg-bg p-5 shadow-2xl" role="dialog" aria-label="Guided tour">
        <p className="text-xs text-muted">Step {i + 1} of {steps.length}</p>
        <h3 className="font-serif text-2xl text-gold">{s.title}</h3>
        <p className="mt-1 text-sm text-fg">{s.text}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button className="text-sm text-muted underline" onClick={onClose}>Skip</button>
          <div className="flex gap-2">
            {i > 0 && <button className="bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold" onClick={() => setI(i - 1)}>Back</button>}
            <button className="border-em rounded-full border px-5 py-2 text-sm text-em" onClick={() => (last ? onClose() : setI(i + 1))}>{last ? "Done" : "Next"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// A small collapsible tips box at the top of a page
export function Tips({ id, items }: { id: string; items: string[] }) {
  const key = `tips-${id}`;
  const [hidden, setHidden] = useState(false);
  useEffect(() => { try { setHidden(localStorage.getItem(key) === "1"); } catch {} }, [key]);
  const set = (h: boolean) => { setHidden(h); try { localStorage.setItem(key, h ? "1" : "0"); } catch {} };
  if (hidden) return <button className="mb-4 text-sm text-em underline" onClick={() => set(false)}>Show tips</button>;
  return (
    <aside className="bd-gold-25 r-card mb-5 border bg-card p-4" data-tour="tips">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-gold">Tips</h2>
        <button className="text-sm text-muted underline" onClick={() => set(true)}>Hide</button>
      </div>
      <ul className="mt-2 grid gap-1 pl-5 text-sm text-muted [list-style:disc]">{items.map((t) => <li key={t}>{t}</li>)}</ul>
    </aside>
  );
}
