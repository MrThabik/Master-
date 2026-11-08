"use client";
// Sticky bar at the bottom of editor pages: always reachable on a phone, shows unsaved changes
export default function SaveBar({ dirty, msg, onSave }: { dirty: boolean; msg: string; onSave: () => void }) {
  return (
    <div className="bd-gold-30 sticky bottom-0 z-30 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <button onClick={onSave} className="border-em rounded-full border px-6 py-3 text-base font-medium text-em">Save changes</button>
      <span className={`text-sm ${dirty ? "text-gold" : "text-muted"}`}>{dirty ? "You have unsaved changes" : "All changes saved"}</span>
      <span className="text-sm text-em">{msg}</span>
    </div>
  );
}
