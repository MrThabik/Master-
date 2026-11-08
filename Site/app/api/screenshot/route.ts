// Install: npm i puppeteer-core @sparticuz/chromium @supabase/supabase-js
// Env (Vercel): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MASTER_EMAIL
// Supabase: create a PUBLIC storage bucket named "screenshots"
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 60;

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const blocked = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.)/;

export async function POST(req: Request) {
  // Only the Master account can capture
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const { data } = await sb.auth.getUser(token);
  if (!data.user || data.user.email !== process.env.MASTER_EMAIL) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { url, id } = await req.json();
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (target.protocol !== "https:" || blocked.test(target.hostname)) {
    return Response.json({ error: "Only public https URLs allowed" }, { status: 400 });
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
  });

  try {
    const page = await browser.newPage();
    await page.goto(target.href, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500)); // let intro animations finish
    const img = await page.screenshot({ type: "jpeg", quality: 80 });

    const path = `${String(id).replace(/[^\w-]/g, "")}-${Date.now()}.jpg`;
    const { error } = await sb.storage
      .from("screenshots")
      .upload(path, img, { contentType: "image/jpeg", upsert: true });
    if (error) throw error;

    const { data: pub } = sb.storage.from("screenshots").getPublicUrl(path);
    return Response.json({ url: pub.publicUrl });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Capture failed" }, { status: 500 });
  } finally {
    await browser.close();
  }
}
