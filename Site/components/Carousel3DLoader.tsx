"use client";
import dynamic from "next/dynamic";
import type { Site } from "@/lib/supabase";

const Carousel3D = dynamic(() => import("./Carousel3D"), { ssr: false });
export default function Carousel3DLoader({ sites, height }: { sites: Site[]; height: number }) {
  return <Carousel3D sites={sites} height={height} />;
}
