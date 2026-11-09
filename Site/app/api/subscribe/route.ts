import { clean, EMAIL, hit, ipOf, json, svc, tooMany } from "@/lib/formGuard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (b.website || Number(b.t) < 1500) return json({ ok: true });

  const email = clean(b.email, 200).toLowerCase();
  if (!EMAIL.test(email)) return json({ error: "email" }, 400);

  const ip = ipOf(req);
  if (await tooMany(ip, "subscribe", 5, 100)) return json({ error: "busy" }, 429);
  const { error } = await svc.from("subscribers").upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
  if (error) return json({ error: "server" }, 500);
  await hit(ip, "subscribe");
  return json({ ok: true });
}
