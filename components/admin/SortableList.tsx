"use client";

import { useState } from "react";

/**
 * A reorderable list. Drag the handle, or use the arrow buttons (keyboard and touch friendly).
 */
export default function SortableList<T>({
  items,
  getKey,
  onChange,
  renderItem,
}: {
  items: T[];
  getKey: (item: T) => string;
  onChange: (next: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  };

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li
          key={getKey(item)}
          onDragOver={(e) => {
            if (dragging === null) return;
            e.preventDefault();
            setOver(i);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragging !== null) move(dragging, i);
            setDragging(null);
            setOver(null);
          }}
          className={`flex items-start gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 transition-shadow ${
            over === i && dragging !== null && dragging !== i ? "ring-2 ring-black" : "ring-black/5"
          } ${dragging === i ? "opacity-50" : ""}`}
        >
          <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} className="h-6 w-6 rounded text-sm hover:bg-neutral-100 disabled:opacity-25">
              ↑
            </button>
            <span
              draggable
              aria-hidden="true"
              title="Drag to reorder"
              onDragStart={(e) => {
                setDragging(i);
                const row = (e.target as HTMLElement).closest("li");
                if (row) e.dataTransfer.setDragImage(row, 16, 16);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => {
                setDragging(null);
                setOver(null);
              }}
              className="cursor-grab select-none px-1 text-lg leading-none text-neutral-500 active:cursor-grabbing"
            >
              ⠿
            </span>
            <button type="button" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} className="h-6 w-6 rounded text-sm hover:bg-neutral-100 disabled:opacity-25">
              ↓
            </button>
          </div>
          <div className="min-w-0 flex-1">{renderItem(item, i)}</div>
        </li>
      ))}
    </ul>
  );
}
