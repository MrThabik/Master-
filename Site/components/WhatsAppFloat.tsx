"use client";
import { usePathname } from "next/navigation";
import { U } from "@/components/T";

// Round WhatsApp button on every public page
export default function WhatsAppFloat({ number, text, top }: { number: string; text: string; top: boolean }) {
  const path = usePathname();
  if (path.startsWith("/developer")) return null;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  return (
    <a href={href} target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp"
      className="fixed right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-black shadow-lg transition hover:scale-110"
      style={top ? { bottom: "calc(20px + env(safe-area-inset-bottom, 0px))" } : { bottom: "calc(84px + env(safe-area-inset-bottom, 0px))" }}>
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true"><path d="M12 3C6.5 3 2 6.9 2 11.7c0 2.4 1.2 4.6 3.2 6.1L4.5 21l3.7-1.7c1.2.4 2.4.6 3.8.6 5.5 0 10-3.9 10-8.7S17.5 3 12 3z" /></svg>
      <span className="sr-only"><U k="whatsapp" /></span>
    </a>
  );
}
