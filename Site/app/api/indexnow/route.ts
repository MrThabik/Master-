import { createClient } from "@supabase/supabase-js";
import { indexNowKey } from "@/lib/indexnow";
import { siteBase } from "@/lib/settings";

export const runtime = "nodejs";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const { data } = await sb.auth.getUser(token);
  if (!data.user || data.user.email !== process.env.MASTER_EMAIL) return Response.json({ error: "Forbidden" }, { status: 403 });

  const base = siteBase();
  const { data: posts } = await sb.from("posts").select("slug").eq("published", true);
  const urlList = [base, `${base}/about`, `${base}/gallery`, `${base}/moodboard`, `${base}/blog`, ...(posts ?? []).map((p) => `${base}/blog/${p.slug}`)];
  const r = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(base).host, key: indexNowKey(), keyLocation: `${base}/indexnow-key.txt`, urlList }),
  });
  return Response.json({ status: r.status, count: urlList.length }, { status: r.ok || r.status === 202 ? 200 : 502 });
}
