"use client";
// Sticky bar at the bottom of editor pages: always reachable on a phone, shows unsaved changes, undo and redo
type P = { dirty: boolean; msg: string; onSave: () => void; onUndo?: () => void; onRedo?: () => void; canUndo?: boolean; canRedo?: boolean };
export default function SaveBar({ dirty, msg, onSave, onUndo, onRedo, canUndo, canRedo }: P) {
  const small = "bd-gold-40 rounded-full border px-4 py-3 text-sm text-gold disabled:opacity-30";
  return (
    <div data-tour="savebar" className="bd-gold-30 sticky bottom-0 z-30 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <button onClick={onSave} className="border-em rounded-full border px-6 py-3 text-base font-medium text-em">Save changes</button>
      {onUndo && <button onClick={onUndo} disabled={!canUndo} className={small} aria-label="Undo">↶ Undo</button>}
      {onRedo && <button onClick={onRedo} disabled={!canRedo} className={small} aria-label="Redo">↷ Redo</button>}
      <span className={`text-sm ${dirty ? "text-gold" : "text-muted"}`}>{dirty ? "You have unsaved changes" : "All changes saved"}</span>
      <span className="text-sm text-em">{msg}</span>
    </div>
  );
}
