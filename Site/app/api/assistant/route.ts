import { createClient } from "@supabase/supabase-js";
import { applyPatch, describeSpec, SPEC } from "@/lib/settings";

export const runtime = "nodejs";
export const maxDuration = 30;

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const json = (b: object, status = 200) => Response.json(b, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const { data } = await sb.auth.getUser(token);
  if (!data.user || data.user.email !== process.env.MASTER_EMAIL) return json({ error: "Forbidden" }, 403);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: "no_key" }, 501);

  const body = await req.json().catch(() => ({}));
  const instruction = String(body.instruction ?? "").trim().slice(0, 800);
  if (!instruction) return json({ error: "empty" }, 400);

  // at most 30 helper requests per hour
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await sb.from("form_hits").select("*", { count: "exact", head: true }).eq("kind", "assistant").gte("at", since);
  if ((count ?? 0) >= 30) return json({ error: "limit" }, 429);
  await sb.from("form_hits").insert({ ip: "admin", kind: "assistant" });

  const current: Record<string, unknown> = {};
  for (const k of Object.keys(SPEC)) if (body.current && k in body.current) current[k] = body.current[k];

  const system = `You help the owner of a personal website change its design and text settings.
Reply with ONLY one JSON object, no other text: {"summary": "...", "changes": {"setting_name": value}}.
Rules:
- Use only these settings and value types:
${describeSpec()}
- Change only what the owner asked for. Never invent setting names. Colors must be #rrggbb. Keep text contrast readable (light text on dark backgrounds).
- "summary" is one or two short sentences saying what you changed, in the same language the owner wrote in (English or Tamil).
- If the request is unclear or needs something not in the list, return "changes": {} and explain in "summary".
- Section order uses the words hero, ring, grid separated by commas. Dock links are lines "Name|/path|Tamil name".`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
      max_tokens: 1200,
      system,
      messages: [{ role: "user", content: `Current settings:\n${JSON.stringify(current).slice(0, 6000)}\n\nOwner's request:\n${instruction}` }],
    }),
  });
  if (!r.ok) return json({ error: "ai_failed", status: r.status }, 502);
  const out = await r.json();
  const text: string = (out.content ?? []).map((c: { text?: string }) => c.text ?? "").join("");
  const m = text.match(/\{[\s\S]*\}/);
  let parsed: { summary?: string; changes?: Record<string, unknown> } = {};
  try { parsed = JSON.parse(m ? m[0] : "{}"); } catch { return json({ error: "bad_reply" }, 502); }
  const { changes, rejected } = applyPatch(parsed.changes ?? {});
  return json({ summary: String(parsed.summary ?? "").slice(0, 400), changes, rejected });
}
