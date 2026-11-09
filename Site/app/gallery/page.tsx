import { supabase } from "@/lib/supabase";
import GallerySlider from "@/components/GallerySlider";
import { getSettings } from "@/lib/settings";

export const revalidate = 30;
export const metadata = { title: "Photo & Art Gallery", description: "Photography, digital art, drawings and paintings by Thaseen Shabik N.", alternates: { canonical: "/gallery" } };

export default async function GalleryPage() {
  const { data } = await supabase.from("artworks").select("*").order("sort");
  const items = (data ?? []).map((a) => ({
    id: a.id, title: a.title, album: a.album, likes: a.likes, views: a.views, width: a.width ?? null, height: a.height ?? null, fit: a.fit ?? "auto", position: a.position ?? "center",
    url: supabase.storage.from("gallery").getPublicUrl(a.image_path).data.publicUrl,
  }));
  const st = await getSettings();
  return <GallerySlider items={items} seconds={st.gallery_seconds} zoom={st.gallery_zoom} wmText={st.watermark_text} wmOpacity={st.watermark_opacity} />;
}
