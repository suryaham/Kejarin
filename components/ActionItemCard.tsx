"use client";

import type { ActionItem, StatusDb } from "@/lib/types";

const STATUS_OPTIONS: { value: StatusDb; label: string }[] = [
  { value: "belum_mulai", label: "Belum Mulai" },
  { value: "berjalan", label: "Berjalan" },
  { value: "selesai", label: "Selesai" },
];

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ActionItemCard({
  item,
  onStatusChange,
}: {
  item: ActionItem;
  onStatusChange: (id: string, status: StatusDb) => void;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {item.deskripsi_tugas}
      </p>
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{item.pic_nama}</span>
        <span>{formatDeadline(item.deadline)}</span>
      </div>
      <select
        className="mt-3 w-full rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        value={item.status}
        onChange={(e) => onStatusChange(item.id, e.target.value as StatusDb)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
