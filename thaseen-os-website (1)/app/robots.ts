import type { MetadataRoute } from "next";
import { siteBase } from "@/lib/settings";

// Search engines and AI search/assistant crawlers may read public pages, never Developer Space.
const open = ["Googlebot", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Google-Extended", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  const base = siteBase();
  const rule = { allow: "/", disallow: ["/developer", "/api/"] };
  return {
    rules: [{ userAgent: "*", ...rule }, ...open.map((userAgent) => ({ userAgent, ...rule }))],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
