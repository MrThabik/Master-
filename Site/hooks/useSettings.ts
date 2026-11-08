"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cleanVerification, DEFAULTS, Settings } from "@/lib/settings";

// Loads the one settings row, tracks unsaved edits, and saves everything back
export function useSettings() {
  const [v, setV] = useState<Settings>(DEFAULTS);
  const [msg, setMsg] = useState("");
  const [loaded, setLoaded] = useState(false);
  const saved = useRef(JSON.stringify(DEFAULTS));

  useEffect(() => {
    supabase.from("settings").select("data").eq("id", 1).single().then(({ data }) => {
      const m = { ...DEFAULTS, ...((data?.data as Partial<Settings>) ?? {}) };
      setV(m);
      saved.current = JSON.stringify(m);
      setLoaded(true);
    });
  }, []);

  const set = <K extends keyof Settings>(k: K, val: Settings[K]) => setV((s) => ({ ...s, [k]: val }));
  const dirty = loaded && JSON.stringify(v) !== saved.current;
  const save = async () => {
    setMsg("Saving…");
    const clean = { ...v, google_verification: cleanVerification(v.google_verification) };
    const { error } = await supabase.from("settings").upsert({ id: 1, data: clean, updated_at: new Date().toISOString() });
    if (error) { setMsg(error.message); return; }
    setV(clean);
    saved.current = JSON.stringify(clean);
    setMsg("Saved. The public site updates within about 30 seconds.");
  };
  return { v, set, save, dirty, msg, loaded };
}
