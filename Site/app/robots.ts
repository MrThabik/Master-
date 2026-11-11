import type { MetadataRoute } from "next";
import { getSettings, siteBase } from "@/lib/settings";

// Search engines and AI search/assistant crawlers may read public pages, never Developer Space.
const open = ["Googlebot", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Google-Extended", "Applebot-Extended"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = siteBase();
  if (!(await getSettings()).robots_index) return { rules: { userAgent: "*", disallow: "/" } };
  const rule = { allow: "/", disallow: ["/developer", "/api/"] };
  return {
    rules: [{ userAgent: "*", ...rule }, ...open.map((userAgent) => ({ userAgent, ...rule }))],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
