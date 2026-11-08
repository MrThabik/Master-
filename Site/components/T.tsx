import type { ReactNode } from "react";
import { UI } from "@/lib/i18n";

// Shows English or Tamil depending on the visitor's language button. Without a Tamil text only English is shown.
export function T({ en, ta }: { en: ReactNode; ta?: ReactNode }) {
  if (!ta) return <>{en}</>;
  return (<><span className="l-en">{en}</span><span className="l-ta">{ta}</span></>);
}
export function U({ k }: { k: keyof typeof UI }) {
  return <T en={UI[k][0]} ta={UI[k][1]} />;
}
