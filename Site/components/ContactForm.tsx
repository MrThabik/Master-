"use client";
import { useRef, useState } from "react";
import { U } from "@/components/T";
import { UI } from "@/lib/i18n";

export default function ContactForm() {
  const born = useRef(Date.now());
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "", website: "" });
  const [state, setState] = useState<"idle" | "busy" | "done" | "err" | "busyLimit">("idle");
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, t: Date.now() - born.current }) });
    if (r.ok) { setState("done"); setF({ name: "", email: "", phone: "", message: "", website: "" }); }
    else setState(r.status === 429 ? "busyLimit" : "err");
  };
  const field = "bd-gold-30 w-full rounded-xl border bg-field p-3 text-base text-fg sm:text-sm";
  if (state === "done") return <p className="bd-gold-30 r-card border bg-card p-5 text-em"><U k="thanks" /></p>;
  return (
    <form onSubmit={submit} className="grid gap-3">
      <input type="text" name="website" value={f.website} onChange={set("website")} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <input required className={field} placeholder={UI.name[0]} aria-label={UI.name[0]} value={f.name} onChange={set("name")} maxLength={100} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input type="email" className={field} placeholder={UI.emailOpt[0]} aria-label={UI.emailOpt[0]} value={f.email} onChange={set("email")} autoCapitalize="none" maxLength={200} />
        <input type="tel" className={field} placeholder={UI.phoneOpt[0]} aria-label={UI.phoneOpt[0]} value={f.phone} onChange={set("phone")} maxLength={40} />
      </div>
      <textarea required className={`${field} min-h-[150px]`} placeholder={UI.message[0]} aria-label={UI.message[0]} value={f.message} onChange={set("message")} maxLength={3000} />
      <button disabled={state === "busy"} className="border-em w-fit rounded-full border px-8 py-3 text-base text-em disabled:opacity-50">{state === "busy" ? <U k="sending" /> : <U k="send" />}</button>
      {state === "err" && <p className="text-sm text-red-400"><U k="failed" /></p>}
      {state === "busyLimit" && <p className="text-sm text-red-400"><U k="busy" /></p>}
    </form>
  );
}
