"use client";
import { useEffect } from "react";

// Only active when the public site is shown inside the editor's preview frame (same origin).
export default function PreviewBridge() {
  useEffect(() => {
    if (window.parent === window) return;
    const on = (e: MessageEvent) => {
      if (e.origin !== location.origin || !e.data || e.data.type !== "admin-theme") return;
      const root = document.documentElement;
      for (const [k, v] of Object.entries((e.data.vars ?? {}) as Record<string, string>)) root.style.setProperty(k, String(v));
      const put = (id: string, make: () => HTMLElement) => (document.getElementById(id) ?? document.head.appendChild(Object.assign(make(), { id })));
      const link = put("pv-font", () => Object.assign(document.createElement("link"), { rel: "stylesheet" })) as HTMLLinkElement;
      if (e.data.fonts) link.href = String(e.data.fonts);
      (put("pv-css", () => document.createElement("style")) as HTMLStyleElement).textContent = String(e.data.css ?? "");
    };
    window.addEventListener("message", on);
    window.parent.postMessage({ type: "preview-ready" }, location.origin);
    return () => window.removeEventListener("message", on);
  }, []);
  return null;
}
