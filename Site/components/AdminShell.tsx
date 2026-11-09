"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SHELL_TOUR, Tour } from "@/components/Tour";
import { useVoice } from "@/hooks/useVoice";

const NAV: [string, string][] = [
  ["/developer", "Dashboard"],
  ["/developer/websites", "Websites"],
  ["/developer/design", "Design & Layout"],
  ["/developer/settings", "Site Settings & SEO"],
  ["/developer/gallery", "Gallery"],
  ["/developer/moodboard", "Mood-board"],
  ["/developer/blog", "Blog"],
  ["/developer/messages", "Messages"],
  ["/developer/subscribers", "Subscribers"],
  ["/developer/history", "History"],
];
const GO: Record<string, string> = {
  dashboard: "/developer", website: "/developer/websites", websites: "/developer/websites", design: "/developer/design", layout: "/developer/design",
  settings: "/developer/settings", seo: "/developer/settings", gallery: "/developer/gallery", moodboard: "/developer/moodboard", blog: "/developer/blog",
  message: "/developer/messages", messages: "/developer/messages", subscriber: "/developer/subscribers", subscribers: "/developer/subscribers", history: "/developer/history",
};

// Responsive admin frame: side menu on laptops, Menu button on phones and tablets, plus guide and voice buttons
export default function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [tour, setTour] = useState(false);
  const [lang, setLang] = useState("en-IN");
  const [heard, setHeard] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("read", false).then(({ count }) => setUnread(count ?? 0));
  }, [path]);
  useEffect(() => { try { if (!localStorage.getItem("tour-done")) { setTour(true); } } catch {} }, []);
  const closeTour = () => { setTour(false); try { localStorage.setItem("tour-done", "1"); } catch {} };

  const say = (t: string, note = "") => { setHeard(note ? `${t} ${note}` : t); clearTimeout(timer.current); timer.current = setTimeout(() => setHeard(""), 5000); };
  const handle = (text: string) => {
    const s = text.toLowerCase().trim();
    const go = s.match(/(?:open|go to|show|take me to)\s+(?:the\s+)?(dashboard|websites?|design|layout|settings|seo|gallery|mood\s?-?board|blog|messages?|subscribers?|history)/);
    if (go) { const key = go[1].replace(/[\s-]/g, ""); if (GO[key]) { say(text, "→ opening"); router.push(GO[key]); return; } }
    if (/^(save|save changes|save it)\b/.test(s)) { say(text, "→ saving"); window.dispatchEvent(new Event("admin-save")); return; }
    if (/^undo\b/.test(s)) { say(text, "→ undo"); window.dispatchEvent(new Event("admin-undo")); return; }
    if (/^redo\b/.test(s)) { say(text, "→ redo"); window.dispatchEvent(new Event("admin-redo")); return; }
    if (/^(guide|help|start the tour)/.test(s)) { setTour(true); return; }
    say(text, "→ sent to the AI helper (open Design or Settings)");
    window.dispatchEvent(new CustomEvent("admin-voice", { detail: text }));
  };
  const voice = useVoice(handle, lang);

  const links = (
    <>
      {NAV.map(([href, label]) => {
        const on = href === "/developer" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)} data-tour={href.split("/").pop() === "developer" ? "home" : href.split("/").pop()}
            className={`block rounded-xl px-4 py-3 text-base transition ${on ? "bg-gold font-medium text-black" : "text-fg hover:bg-card"}`}>
            {label}{href === "/developer/messages" && unread > 0 && <span className="ml-2 rounded-full bg-em px-2 text-xs text-black">{unread}</span>}
          </Link>
        );
      })}
      <button onClick={() => supabase.auth.signOut()} className="bd-gold-40 mt-2 w-full rounded-xl border px-4 py-3 text-left text-base text-gold">Sign out</button>
    </>
  );
  const pill = "bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold transition hover:bg-card";
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside data-tour="menu" className="bd-gold-25 sticky top-0 hidden h-screen flex-col gap-1 overflow-y-auto border-r p-4 lg:flex">
        <p className="adm-title mb-3 px-4 font-serif text-2xl">Developer Space</p>
        {links}
      </aside>
      <header className="bd-gold-25 sticky top-0 z-40 border-b bg-bg/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="adm-title font-serif text-xl">Developer Space</p>
          <button data-tour="menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={pill}>{open ? "Close" : "Menu"}</button>
        </div>
        {open && <nav className="grid gap-1 px-3 pb-4">{links}</nav>}
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
          {voice.supported && (
            <span data-tour="voice" className="flex items-center gap-2">
              <select aria-label="Voice language" value={lang} onChange={(e) => setLang(e.target.value)} className="bd-gold-30 rounded-full border bg-field px-3 py-2 text-sm text-fg"><option value="en-IN">English</option><option value="ta-IN">தமிழ்</option></select>
              <button onClick={() => (voice.on ? voice.stop() : voice.start())} className={`${pill} ${voice.on ? "bg-em !text-black" : ""}`} aria-pressed={voice.on}>{voice.on ? "Listening…" : "🎤 Voice"}</button>
            </span>
          )}
          <button className={pill} onClick={() => setTour(true)}>Guide</button>
          <a data-tour="site" href="/" target="_blank" rel="noopener" className={`${pill} !text-em`}>View website ↗</a>
        </div>
        {heard && <p className="bd-gold-30 r-card mb-3 border bg-card px-4 py-2 text-sm text-fg" role="status">🎤 {heard}</p>}
        <div key={path} className="adm-in">{children}</div>
      </div>
      {tour && <Tour steps={SHELL_TOUR} onClose={closeTour} />}
    </div>
  );
}
