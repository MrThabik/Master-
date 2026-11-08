import type { Metadata } from "next";
import { ReactNode } from "react";

// Keep Developer Space out of search engines
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export default function DevLayout({ children }: { children: ReactNode }) { return children; }
