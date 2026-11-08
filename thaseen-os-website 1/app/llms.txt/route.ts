import { supabase } from "@/lib/supabase";
import { getSettings, list, siteBase } from "@/lib/settings";

export const revalidate = 3600;

// A plain-text summary for AI assistants and AI search tools
export async function GET() {
  const s = await getSettings();
  const base = siteBase();
  const { data: posts } = await supabase.from("posts").select("slug,title,lang").eq("published", true).order("created_at", { ascending: false });
  const names = Array.from(new Set([s.owner_name, ...list(s.also_known_as)])).join(", ");
  const body = [
    `# ${s.owner_name}`,
    `> ${s.seo_description}`,
    "",
    `${s.owner_name} (also searched as: ${names}) works as ${s.job_title}. This is the official website: ${base}`,
    "",
    "## About",
    s.about_body,
    "",
    "## Pages",
    `- [Home](${base}): all websites by ${s.owner_name}`,
    `- [About](${base}/about): who ${s.owner_name} is`,
    `- [Photo & Art Gallery](${base}/gallery)`,
    `- [Mood-board](${base}/moodboard)`,
    `- [Blog](${base}/blog): notes in Tamil and English`,
    ...(posts?.length ? ["", "## Blog posts", ...posts.map((p) => `- [${p.title}](${base}/blog/${p.slug}) (${p.lang})`)] : []),
    "",
    "## Other official websites and profiles",
    ...list(s.same_as).map((u) => `- ${u}`),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
