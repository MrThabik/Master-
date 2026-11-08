import { createHash, scryptSync, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const svc = createClient(URL_, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const anon = createClient(URL_, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_GLOBAL = 30;

const sha = (s: string) => createHash("sha256").update(s).digest();
const sameText = (a: string, b: string) => timingSafeEqual(sha(a), sha(b));
function sameSecret(input: string, stored = "") {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = scryptSync(input, salt, 64);
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  // Lockout: too many recent failures from this address, or from everywhere
  const [mine, all] = await Promise.all([
    svc.from("admin_attempts").select("*", { count: "exact", head: true }).eq("ip", ip).gte("at", since),
    svc.from("admin_attempts").select("*", { count: "exact", head: true }).gte("at", since),
  ]);
  if ((mine.count ?? 0) >= MAX_PER_IP || (all.count ?? 0) >= MAX_GLOBAL) {
    return json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
  }

  let b: { username?: string; password?: string; pin?: string } = {};
  try { b = await req.json(); } catch {}
  const username = String(b.username ?? "").trim().toLowerCase().slice(0, 100);
  const password = String(b.password ?? "").trim().slice(0, 200);
  const pin = String(b.pin ?? "").trim().slice(0, 20);

  // All three are always checked, so a wrong answer reveals nothing about which one failed
  const okUser = sameText(username, (process.env.ADMIN_USERNAME ?? "\u0000").trim().toLowerCase());
  const okPass = sameSecret(password, process.env.ADMIN_PASSWORD_HASH);
  const okPin = sameSecret(pin, process.env.ADMIN_PIN_HASH);

  if (!(okUser && okPass && okPin)) {
    await svc.from("admin_attempts").insert({ ip });
    await new Promise((r) => setTimeout(r, 600));
    return json({ error: "Access denied" }, 401);
  }

  // The Supabase password is a long random secret that only this server knows
  const { data, error } = await anon.auth.signInWithPassword({
    email: process.env.MASTER_EMAIL!,
    password: process.env.ADMIN_SUPABASE_PASSWORD!,
  });
  if (error || !data.session) return json({ error: "Server sign-in failed. Check the Supabase setup." }, 500);

  await svc.from("admin_attempts").delete().eq("ip", ip);
  return json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
}
