"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";

// Google Analytics, only when an ID is set in Site Settings, and never inside Developer Space
export default function Analytics({ id }: { id: string }) {
  const path = usePathname();
  if (!id || path.startsWith("/developer")) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');`}</Script>
    </>
  );
}
