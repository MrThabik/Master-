"use client";
import { TEMPLATES, type Settings } from "@/lib/settings";

// One-tap looks: colours, fonts, shapes and layout together. Undo is in the bottom bar.
export default function TemplatePicker({ onApply }: { onApply: (v: Partial<Settings>) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4" data-tour="templates">
      {Object.entries(TEMPLATES).map(([name, t]) => {
        const v = t.v;
        return (
          <button key={name} onClick={() => onApply(t.v)} className="bd-gold-25 r-card adm-card border bg-card p-3 text-left">
            <div className="flex h-16 items-center gap-2 rounded-lg px-3" style={{ background: v.color_bg, color: v.color_text }}>
              <span className="text-3xl" style={{ color: v.gold, fontFamily: `"${v.font_heading}", serif` }}>Aa</span>
              <span className="h-3 w-3 rounded-full" style={{ background: v.gold }} />
              <span className="h-3 w-3 rounded-full" style={{ background: v.emerald }} />
              <span className="ml-auto text-xs" style={{ color: v.color_muted }}>{v.font_body}</span>
            </div>
            <p className="mt-2 font-serif text-lg text-gold">{name}</p>
            <p className="text-xs text-muted">{t.note}</p>
          </button>
        );
      })}
    </div>
  );
}
