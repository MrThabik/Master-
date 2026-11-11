"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cleanVerification, DEFAULTS, Settings } from "@/lib/settings";

const token = async () => (await supabase.auth.getSession()).data.session?.access_token;

// Loads the one settings row; tracks unsaved edits with undo and redo; saves, keeps a version, refreshes the public site
export function useSettings() {
  const [v, setV] = useState<Settings>(DEFAULTS);
  const [msg, setMsg] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [, bump] = useState(0);
  const saved = useRef(JSON.stringify(DEFAULTS));
  const cur = useRef(v);
  cur.current = v;
  const past = useRef<Settings[]>([]);
  const future = useRef<Settings[]>([]);
  const last = useRef({ k: "", t: 0 });

  useEffect(() => {
    supabase.from("settings").select("data").eq("id", 1).single().then(({ data }) => {
      const m = { ...DEFAULTS, ...((data?.data as Partial<Settings>) ?? {}) };
      setV(m);
      saved.current = JSON.stringify(m);
      setLoaded(true);
    });
  }, []);

  // typing in the same field within one second counts as one undo step
  const remember = (k: string) => {
    const now = Date.now();
    if (last.current.k !== k || now - last.current.t > 1000) {
      past.current.push(cur.current);
      if (past.current.length > 60) past.current.shift();
      future.current = [];
    }
    last.current = { k, t: now };
  };
  const set = <K extends keyof Settings>(k: K, val: Settings[K]) => { remember(String(k)); setV((s) => ({ ...s, [k]: val })); };
  const patch = (changes: Partial<Settings>) => { remember("patch" + Date.now()); setV((s) => ({ ...s, ...changes })); };
  const undo = () => { const p = past.current.pop(); if (!p) return; future.current.push(cur.current); last.current = { k: "", t: 0 }; setV(p); bump((n) => n + 1); };
  const redo = () => { const n = future.current.pop(); if (!n) return; past.current.push(cur.current); last.current = { k: "", t: 0 }; setV(n); bump((x) => x + 1); };

  const dirty = loaded && JSON.stringify(v) !== saved.current;
  const save = async () => {
    setMsg("Saving…");
    const clean = { ...cur.current, google_verification: cleanVerification(cur.current.google_verification) };
    const { error } = await supabase.from("settings").upsert({ id: 1, data: clean, updated_at: new Date().toISOString() });
    if (error) { setMsg(error.message); return; }
    setV(clean);
    saved.current = JSON.stringify(clean);
    // keep this version (last 30) and refresh the public website; neither blocks the save
    const ver = await supabase.from("settings_versions").insert({ data: clean });
    if (!ver.error) {
      const { data: old } = await supabase.from("settings_versions").select("id").order("id", { ascending: false }).range(30, 400);
      if (old?.length) await supabase.from("settings_versions").delete().in("id", old.map((o) => o.id));
    }
    const t = await token();
    const rv = await fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${t}` } }).catch(() => null);
    setSavedAt(Date.now());
    setMsg(`Saved${ver.error ? " (run the Update 5 SQL to keep History)" : ""}. ${rv?.ok ? "The public website is updated." : "The public site updates within about 30 seconds."}`);
  };

  // voice and keyboard commands from the admin frame
  const fns = useRef({ save, undo, redo });
  fns.current = { save, undo, redo };
  useEffect(() => {
    const a = () => fns.current.save(), b = () => fns.current.undo(), c = () => fns.current.redo();
    window.addEventListener("admin-save", a); window.addEventListener("admin-undo", b); window.addEventListener("admin-redo", c);
    return () => { window.removeEventListener("admin-save", a); window.removeEventListener("admin-undo", b); window.removeEventListener("admin-redo", c); };
  }, []);

  return { v, set, patch, save, undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0, dirty, msg, loaded, savedAt };
}
