"use client";
import { useRef, useState } from "react";
import { T, U } from "@/components/T";
import { UI } from "@/lib/i18n";

// "Get new posts by email" box (blog pages)
export default function SubscribeBox() {
  const born = useRef(Date.now());
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "bad" | "err">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    const r = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, website: hp, t: Date.now() - born.current }) });
    setState(r.ok ? "done" : r.status === 400 ? "bad" : "err");
    if (r.ok) setEmail("");
  };
  return (
    <section className="bd-gold-25 r-card my-10 border bg-card p-5">
      <h2 className="font-serif text-2xl text-gold"><U k="subscribeTitle" /></h2>
      {state === "done" ? (
        <p className="mt-2 text-em"><U k="subscribed" /></p>
      ) : (
        <form onSubmit={submit} className="mt-3 flex flex-wrap gap-2">
          <input type="text" name="website" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={UI.email[0]} aria-label={UI.email[0]} autoCapitalize="none"
            className="bd-gold-30 min-w-[200px] flex-1 rounded-full border bg-field px-4 py-3 text-base text-fg sm:text-sm" />
          <button disabled={state === "busy"} className="border-em rounded-full border px-6 py-3 text-sm text-em disabled:opacity-50"><U k="subscribe" /></button>
        </form>
      )}
      {state === "bad" && <p className="mt-2 text-sm text-red-400"><U k="invalidEmail" /></p>}
      {state === "err" && <p className="mt-2 text-sm text-red-400"><U k="busy" /></p>}
      <p className="mt-2 text-xs text-muted"><T en={UI.subscribeNote[0]} ta={UI.subscribeNote[1]} /></p>
    </section>
  );
}
