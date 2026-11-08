"use client";
import { useEffect, useState } from "react";

type P = { line1: string; title: string; tagline: string; seconds: number; everyVisit: boolean; bg: string };

// Opening screen: optional first line (for example Bismillah), then the website name. Tap to skip.
export default function Intro({ line1, title, tagline, seconds, everyVisit, bg }: P) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(line1 ? 0 : 1);
  const [out, setOut] = useState(false);

  useEffect(() => {
    if (!everyVisit) { try { if (sessionStorage.getItem("intro")) return; sessionStorage.setItem("intro", "1"); } catch {} }
    setShow(true);
    const total = seconds * 1000;
    const t = [
      line1 ? setTimeout(() => setStep(1), total * 0.5) : undefined,
      setTimeout(() => setOut(true), total - 900),
      setTimeout(() => setShow(false), total),
    ];
    return () => t.forEach((x) => x && clearTimeout(x));
  }, [line1, seconds, everyVisit]);

  if (!show) return null;
  const skip = () => { setOut(true); setTimeout(() => setShow(false), 500); };
  return (
    <div onClick={skip} style={{ background: bg }} className={`fixed inset-0 z-[100] grid cursor-pointer place-items-center px-4 text-center transition-opacity duration-700 ${out ? "opacity-0" : "opacity-100"}`}>
      <div className="relative h-44 w-full">
        {line1 && (
          <p className={`absolute inset-x-0 top-6 text-3xl text-gold transition-opacity duration-1000 sm:text-5xl lg:text-6xl ${step === 0 ? "opacity-100" : "opacity-0"}`} style={{ fontFamily: "Amiri, serif" }} dir="auto">
            {line1}
          </p>
        )}
        <div className={`absolute inset-x-0 top-2 transition-opacity duration-1000 ${step === 1 ? "opacity-100" : "opacity-0"}`}>
          <h1 className="bg-gradient-to-r from-[var(--gold)] via-[var(--fg)] to-[var(--em)] bg-clip-text font-serif text-4xl text-transparent sm:text-6xl lg:text-7xl">{title}</h1>
          <p className="mt-2 text-[11px] uppercase tracking-[.3em] text-gold sm:text-xs sm:tracking-[.4em]">{tagline}</p>
        </div>
      </div>
    </div>
  );
}
