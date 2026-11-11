import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

// Makes the public website show your latest saved changes immediately instead of after about 30 seconds
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const { data } = await sb.auth.getUser(token);
  if (!data.user || data.user.email !== process.env.MASTER_EMAIL) return Response.json({ error: "Forbidden" }, { status: 403 });
  revalidatePath("/", "layout");
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
