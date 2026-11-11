"use client";
import { parseSections, SECTION_KEYS, SECTION_LABELS } from "@/lib/settings";
import { useDnD } from "@/hooks/useDnD";

// Choose which blocks appear on the home page and in what order: drag, use the arrows, remove or add.
export default function SectionBuilder({ value, onChange }: { value: string; onChange: (csv: string) => void }) {
  const active = parseSections(value);
  const unused = SECTION_KEYS.filter((k) => !active.includes(k));
  const commit = (a: string[]) => onChange(a.join(","));
  const dnd = useDnD(active as string[], commit);
  const move = (i: number, d: number) => { const a = [...active] as string[]; if (!a[i + d]) return; [a[i], a[i + d]] = [a[i + d], a[i]]; commit(a); };
  const b = "bd-gold-40 rounded-full border px-3 py-2 text-sm text-gold";
  return (
    <div className="grid gap-2" data-tour="sections">
      {active.map((k, i) => (
        <div key={k} {...dnd(i)} className="bd-gold-25 flex cursor-grab items-center gap-2 rounded-lg border bg-card p-2 active:cursor-grabbing">
          <span aria-hidden className="px-1 text-muted">⠿</span>
          <span className="flex-1 text-sm text-fg">{i + 1}. {SECTION_LABELS[k]}</span>
          <button className={b} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
          <button className={b} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
          <button className={b} onClick={() => commit((active as string[]).filter((x) => x !== k))} aria-label="Remove">✕</button>
        </div>
      ))}
      {unused.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-muted">Add a section:</p>
          <div className="flex flex-wrap gap-2">{unused.map((k) => <button key={k} className={b} onClick={() => commit([...(active as string[]), k])}>+ {SECTION_LABELS[k]}</button>)}</div>
        </div>
      )}
    </div>
  );
}
