"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Use inside each website row in Developer Space > Websites Manager:
// <CaptureButton id={site.id} url={site.url} onDone={(u) => updateSite(site.id, { screenshot: u })} />
export function CaptureButton({
  id,
  url,
  onDone,
}: {
  id: string;
  url: string;
  onDone: (screenshotUrl: string) => void;
}) {
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");

  async function capture() {
    setState("busy");
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/screenshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session?.access_token}`,
        },
        body: JSON.stringify({ id, url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onDone(json.url);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <button onClick={capture} disabled={state === "busy"} className="btn">
      {state === "busy" ? "Capturing…" : state === "error" ? "Failed, retry" : "Capture screenshot"}
    </button>
  );
}
