import { createClient } from "@supabase/supabase-js";

// The admin session lives in sessionStorage, so closing the browser tab signs you out.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { storage: typeof window !== "undefined" ? window.sessionStorage : undefined } }
);

export type Site = {
  id: string; name: string; url: string; description: string; tags: string[];
  screenshot_url: string | null; live_preview: boolean; hidden: boolean; sort: number; visits: number;
};
