import { clean, EMAIL, hit, ipOf, json, svc, tooMany } from "@/lib/formGuard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  // robots fill the hidden field or send instantly: pretend it worked and drop it
  if (b.website || Number(b.t) < 2500) return json({ ok: true });

  const name = clean(b.name, 100), email = clean(b.email, 200), phone = clean(b.phone, 40), message = clean(b.message, 3000);
  if (!name || message.length < 2) return json({ error: "invalid" }, 400);
  if (email && !EMAIL.test(email)) return json({ error: "email" }, 400);

  const ip = ipOf(req);
  if (await tooMany(ip, "contact", 5, 60)) return json({ error: "busy" }, 429);
  const { error } = await svc.from("messages").insert({ name, email: email || null, phone: phone || null, message });
  if (error) return json({ error: "server" }, 500);
  await hit(ip, "contact");
  return json({ ok: true });
}
