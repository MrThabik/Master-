"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type P = { links: { label: string; href: string }[]; position: "bottom" | "top"; showToggle: boolean };

// Floating glass navigation. Links, position and the dark/light switch come from Design & Layout.
export default function Dock({ links, position, showToggle }: P) {
  const path = usePathname();
  const [light, setLight] = useState(false);
  useEffect(() => setLight(document.documentElement.classList.contains("light")), []);
  if (path.startsWith("/developer")) return null;

  const toggle = () => {
    const l = !light;
    setLight(l);
    document.documentElement.classList.toggle("light", l);
    try { localStorage.setItem("theme", l ? "light" : "dark"); } catch {}
  };
  const edge = position === "top" ? { top: "calc(12px + env(safe-area-inset-top, 0px))" } : { bottom: "calc(16px + env(safe-area-inset-bottom, 0px))" };
  return (
    <nav className="bd-gold-30 fixed left-1/2 z-50 flex max-w-[94vw] -translate-x-1/2 items-center gap-1 overflow-x-auto whitespace-nowrap rounded-full border px-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,.35)] backdrop-blur-xl" style={{ ...edge, background: "var(--dock)" }}>
      {links.map(({ label, href }) => {
        const external = /^https?:\/\//.test(href);
        const on = !external && (href === "/" ? path === "/" : path.startsWith(href));
        return (
          <Link key={label + href} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener" : undefined}
            className={`rounded-full px-3 py-2 text-xs transition duration-200 hover:scale-105 sm:px-4 sm:text-sm ${on ? "bg-gold text-black" : "text-fg"}`}>{label}</Link>
        );
      })}
      {showToggle && (
        <button onClick={toggle} aria-label="Toggle dark or light mode" className="bd-gold-40 ml-1 shrink-0 rounded-full border px-3 py-2 text-xs text-gold transition hover:scale-105 sm:text-sm">{light ? "Dark" : "Light"}</button>
      )}
    </nav>
  );
}
