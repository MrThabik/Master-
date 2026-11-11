import type { ReactNode } from "react";

// Safe mini-markdown for blog posts: # headings, **bold**, *italic*, `code`, [text](url), - lists, 1. lists, > quotes, ![alt](url)
const safeUrl = (u: string) => (/^(https?:\/\/|mailto:|\/)/i.test(u.trim()) ? u.trim() : "#");

function inline(s: string, k: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0, i = 0, m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) out.push(<strong key={`${k}${i++}`}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={`${k}${i++}`} className="rounded bg-card px-1 text-[.92em]">{t.slice(1, -1)}</code>);
    else if (t.startsWith("[")) {
      const mm = t.match(/\[([^\]]+)\]\(([^)]+)\)/)!;
      out.push(<a key={`${k}${i++}`} href={safeUrl(mm[2])} className="text-em underline" rel="noopener" target={/^https?:/i.test(mm[2]) ? "_blank" : undefined}>{mm[1]}</a>);
    } else out.push(<em key={`${k}${i++}`}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

export function renderMd(text: string): ReactNode[] {
  return String(text ?? "").replace(/\r/g, "").split(/\n\s*\n/).map((raw, i) => {
    const t = raw.trim();
    if (!t) return null;
    const k = `b${i}`;
    const h = t.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const cls = h[1].length === 1 ? "text-3xl" : h[1].length === 2 ? "text-2xl" : "text-xl";
      return <h2 key={k} className={`mb-3 mt-8 font-serif text-gold ${cls}`}>{inline(h[2], k)}</h2>;
    }
    const img = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img && /^(https?:\/\/|\/)/i.test(img[2].trim())) {
      return <figure key={k} className="my-6"><img src={img[2].trim()} alt={img[1]} loading="lazy" className="r-card w-full" />{img[1] && <figcaption className="mt-2 text-center text-sm text-muted">{img[1]}</figcaption>}</figure>;
    }
    if (t.startsWith(">")) return <blockquote key={k} className="my-5 border-l-4 border-gold pl-4 italic text-muted">{inline(t.replace(/^>\s?/gm, "").replace(/\n/g, " "), k)}</blockquote>;
    const lines = t.split("\n");
    if (lines.every((l) => /^(\s*[-*]\s+|\s*\d+\.\s+)/.test(l))) {
      const ordered = /^\s*\d+\./.test(lines[0]);
      const items = lines.map((l, j) => <li key={`${k}${j}`}>{inline(l.replace(/^\s*([-*]|\d+\.)\s+/, ""), `${k}${j}`)}</li>);
      return ordered ? <ol key={k} className="my-4 list-decimal pl-6">{items}</ol> : <ul key={k} className="my-4 list-disc pl-6">{items}</ul>;
    }
    return <p key={k} className="mb-4">{lines.map((l, j) => <span key={j}>{j > 0 && <br />}{inline(l, `${k}${j}`)}</span>)}</p>;
  });
}
export const readingMinutes = (text: string) => Math.max(1, Math.round(String(text ?? "").trim().split(/\s+/).length / 200));

export function Md({ text }: { text: string }) { return <>{renderMd(text)}</>; }
export const plainText = (md: string) => String(md ?? "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[#>*`_]/g, "").replace(/\s+/g, " ").trim();
