import type { Metadata } from "next";
import type { Settings } from "@/lib/settings";

// Uses the title and description you set per page in Site Settings, otherwise the defaults of that page
export function pageMeta(s: Settings, path: string, fallbackTitle: string, fallbackDesc: string): Metadata {
  const o = s.page_seo[path];
  const title = o?.title || fallbackTitle;
  const description = o?.description || fallbackDesc;
  return { title: { absolute: o?.title ? o.title : `${fallbackTitle} | ${s.owner_name}` }, description, alternates: { canonical: path }, openGraph: { title, description } };
}
