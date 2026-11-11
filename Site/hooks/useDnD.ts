"use client";
import { useRef } from "react";

// Drag and drop reordering for lists (desktop). Arrow buttons stay available for phones.
export function useDnD<T>(list: T[], commit: (next: T[]) => void) {
  const from = useRef<number | null>(null);
  return (i: number) => ({
    draggable: true,
    onDragStart: () => { from.current = i; },
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const f = from.current;
      from.current = null;
      if (f === null || f === i) return;
      const next = [...list];
      const [m] = next.splice(f, 1);
      next.splice(i, 0, m);
      commit(next);
    },
  });
}
