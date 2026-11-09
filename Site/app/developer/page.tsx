"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import { Tips } from "@/components/Tour";

const count = async (table: string, f?: (q: any) => any) => {
  let q: any = supabase.from(table).select("*", { count: "exact", head: true });
  if (f) q = f(q);
  const { count } = await q;
  return (count ?? 0) as number;
};

function Dashboard() {
  const [c, setC] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  useEffect(() => {
    (async () => {
      const [sites, art, moods, posts, pub, msgs, unread, subs] = await Promise.all([
        count("sites"), count("artworks"), count("moods"), count("posts"), count("posts", (q) => q.eq("published", true)),
        count("messages"), count("messages", (q) => q.eq("read", false)), count("subscribers"),
      ]);
      setC({ sites, art, moods, posts, pub, msgs, unread, subs });
    })();
  }, []);
  const refresh = async () => {
    setNote("Refreshing…");
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${data.session?.access_token}` } });
    setNote(r.ok ? "The public website was refreshed." : "Could not refresh.");
  };
  const cards: [string, number | undefined, string, string][] = [
    ["Websites", c.sites, "cards on your home page", "/developer/websites"],
    ["Gallery photos", c.art, "in the cinematic gallery", "/developer/gallery"],
    ["Mood-board", c.moods, "photos", "/developer/moodboard"],
    ["Blog posts", c.pub, `published, ${(c.posts ?? 0) - (c.pub ?? 0)} drafts`, "/developer/blog"],
    ["Messages", c.unread, `unread of ${c.msgs ?? 0}`, "/developer/messages"],
    ["Subscribers", c.subs, "want new posts", "/developer/subscribers"],
  ];
  const act = "bd-gold-40 r-card adm-card border bg-card px-4 py-4 text-left text-base text-gold";
  return (
    <div>
      <h1 className="adm-title font-serif text-4xl">Dashboard</h1>
      <p className="mt-1 text-muted">Everything about your website at a glance.</p>
      <div className="mt-5"><Tips id="dashboard" items={["Tap a card to open that manager.", "Use the Guide button for a short tour, or the Voice button to say “open gallery”.", "Design & Layout has a live preview and an AI helper that applies changes you describe.", "Every save in Design and Settings is kept in History, so you can go back."]} /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([t, n, sub, href]) => (
          <Link key={t} href={href} className="bd-gold-25 r-card adm-card border bg-card p-5">
            <p className="text-sm text-muted">{t}</p>
            <p className="font-serif text-5xl text-gold">{n ?? "–"}</p>
            <p className="text-sm text-muted">{sub}</p>
          </Link>
        ))}
      </div>
      <h2 className="mb-3 mt-8 font-serif text-2xl text-gold">Quick actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/developer/websites" className={act}>+ Add a website</Link>
        <Link href="/developer/gallery" className={act}>Upload photos</Link>
        <Link href="/developer/blog" className={act}>Write a blog post</Link>
        <Link href="/developer/design" className={act}>Edit the design</Link>
        <Link href="/developer/settings" className={act}>Site settings and SEO</Link>
        <Link href="/developer/history" className={act}>Restore an earlier version</Link>
        <button className={act} onClick={refresh}>Refresh the public website now</button>
        <a href="/" target="_blank" rel="noopener" className={act}>Open the public website ↗</a>
      </div>
      <p className="mt-3 text-em">{note}</p>
    </div>
  );
}

export default function Page() { return <Gate><Dashboard /></Gate>; }
