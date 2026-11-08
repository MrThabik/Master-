import { createClient } from "@supabase/supabase-js";

// Server-only helpers for the public forms (contact and subscribe)
export const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
export const ipOf = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
export const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max);
export const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// too many tries from one address in the last hour, or from everywhere
export async function tooMany(ip: string, kind: string, perIp: number, global: number) {
  const since = new Date(Date.now() - 3600_000).toISOString();
  const [a, b] = await Promise.all([
    svc.from("form_hits").select("*", { count: "exact", head: true }).eq("kind", kind).eq("ip", ip).gte("at", since),
    svc.from("form_hits").select("*", { count: "exact", head: true }).eq("kind", kind).gte("at", since),
  ]);
  return (a.count ?? 0) >= perIp || (b.count ?? 0) >= global;
}
export const hit = (ip: string, kind: string) => svc.from("form_hits").insert({ ip, kind });
