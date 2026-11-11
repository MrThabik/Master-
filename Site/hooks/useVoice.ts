"use client";
import { useEffect, useRef, useState } from "react";

// Speech to text with the browser's own recogniser (works in Chrome and Edge). Nothing is sent to us.
export function useVoice(onText: (t: string) => void, lang: string) {
  const [on, setOn] = useState(false);
  const [supported, setSupported] = useState(false);
  const rec = useRef<any>(null);
  const cb = useRef(onText);
  cb.current = onText;
  useEffect(() => { setSupported(!!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)); }, []);
  const stop = () => { try { rec.current?.stop(); } catch {} };
  const start = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = lang; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e: any) => cb.current(String(e.results[0][0].transcript || ""));
    r.onend = () => setOn(false);
    r.onerror = () => setOn(false);
    rec.current = r;
    try { r.start(); setOn(true); } catch { setOn(false); }
  };
  return { supported, on, start, stop };
}
