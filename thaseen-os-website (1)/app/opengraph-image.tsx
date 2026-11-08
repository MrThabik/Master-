import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";

export const alt = "Thaseen Shabik N | THASEEN OS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function OG() {
  const s = await getSettings();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#060807,#0b1a14)", color: "#f2efe6", border: "12px solid #d4af37" }}>
        <div style={{ fontSize: 26, letterSpacing: 10, color: "#d4af37" }}>{s.tagline.toUpperCase()}</div>
        <div style={{ fontSize: 110, fontWeight: 700, marginTop: 24, color: "#d4af37" }}>{s.site_name}</div>
        <div style={{ fontSize: 48, marginTop: 16 }}>{s.owner_name}</div>
        <div style={{ fontSize: 28, marginTop: 10, color: "#34d399" }}>{s.job_title}</div>
      </div>
    ),
    size
  );
}
