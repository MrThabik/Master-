"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { supabase } from "@/lib/supabase";

const NAV: [string, string][] = [
  ["/developer", "Websites"],
  ["/developer/design", "Design & Layout"],
  ["/developer/settings", "Site Settings & SEO"],
  ["/developer/gallery", "Gallery"],
  ["/developer/moodboard", "Mood-board"],
  ["/developer/blog", "Blog"],
];

// Responsive admin frame: side menu on laptops, top bar with a menu on phones and tablets
export default function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = (
    <>
      {NAV.map(([href, label]) => {
        const on = href === "/developer" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)} className={`block rounded-xl px-4 py-3 text-base ${on ? "bg-gold font-medium text-black" : "text-fg hover:bg-card"}`}>{label}</Link>
        );
      })}
      <a href="/" target="_blank" rel="noopener" className="block rounded-xl px-4 py-3 text-base text-em">View website ↗</a>
      <button onClick={() => supabase.auth.signOut()} className="bd-gold-40 mt-2 w-full rounded-xl border px-4 py-3 text-left text-base text-gold">Sign out</button>
    </>
  );
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bd-gold-25 sticky top-0 hidden h-screen flex-col gap-1 overflow-y-auto border-r p-4 lg:flex">
        <p className="mb-3 px-4 font-serif text-2xl text-gold">Developer Space</p>
        {links}
      </aside>
      <header className="bd-gold-25 sticky top-0 z-40 border-b bg-bg/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="font-serif text-xl text-gold">Developer Space</p>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold">{open ? "Close" : "Menu"}</button>
        </div>
        {open && <nav className="grid gap-1 px-3 pb-4">{links}</nav>}
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
