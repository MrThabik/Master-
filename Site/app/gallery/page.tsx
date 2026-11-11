import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import GallerySlider, { type Art } from "@/components/GallerySlider";
import GalleryMasonry from "@/components/GalleryMasonry";
import { albumList, getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const revalidate = 30;
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMeta(s, "/gallery", "Photo & Art Gallery", "Photography, digital art, drawings and paintings by Thaseen Shabik N.");
}

export default async function GalleryPage() {
  const st = await getSettings();
  const { data } = await supabase.from("artworks").select("*").order("sort");
  const items: Art[] = (data ?? []).filter((a) => !a.hidden).map((a) => ({
    id: a.id, title: a.title, album: a.album, likes: a.likes, views: a.views, width: a.width ?? null, height: a.height ?? null, fit: a.fit ?? "auto", position: a.position ?? "center",
    caption: a.caption ?? null, link_url: a.link_url ?? null, url: supabase.storage.from("gallery").getPublicUrl(a.image_path).data.publicUrl,
  }));
  const albums = albumList(st.gallery_albums);
  if (st.gallery_layout === "masonry") return <GalleryMasonry items={items} albums={albums} wmText={st.watermark_text} wmOpacity={st.watermark_opacity} caption={st.gallery_caption} />;
  return <GallerySlider items={items} opts={{ seconds: st.gallery_seconds, zoom: st.gallery_zoom, wmText: st.watermark_text, wmOpacity: st.watermark_opacity, albums, transition: st.gallery_transition, overlay: st.gallery_overlay, caption: st.gallery_caption, autoplay: st.gallery_autoplay, arrows: st.gallery_arrows, wholeBg: st.gallery_whole_bg }} />;
}
