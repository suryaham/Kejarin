"use client";

import { Calendar } from "lucide-react";
import type { ActionItem, StatusDb, StatusPapan } from "@/lib/types";
import { COLUMN_STYLES, STATUS_LABEL, avatarColorFor } from "@/lib/statusStyles";

const STATUS_OPTIONS: StatusDb[] = ["belum_mulai", "berjalan", "selesai"];

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ActionItemCard({
  item,
  columnStatus,
  onStatusChange,
}: {
  item: ActionItem;
  columnStatus: StatusPapan;
  onStatusChange: (id: string, status: StatusDb) => void;
}) {
  const style = COLUMN_STYLES[columnStatus];
  const initial = item.pic_nama.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`group rounded-xl border-l-4 ${style.cardAccent} bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900`}
    >
      <p className="text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
        {item.deskripsi_tugas}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white ${avatarColorFor(
              item.pic_nama
            )}`}
            title={item.pic_nama}
          >
            {initial}
          </span>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {item.pic_nama}
          </span>
        </div>
        <div
          className={`flex items-center gap-1 text-xs ${
            columnStatus === "overdue"
              ? "font-semibold text-rose-600 dark:text-rose-400"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          <Calendar size={13} />
          {formatDeadline(item.deadline)}
        </div>
      </div>

      <select
        className={`mt-3 w-full cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-medium ${style.badgeBg} ${style.badgeText} outline-none ring-1 ring-inset ring-black/5 transition-opacity hover:opacity-80 dark:ring-white/10`}
        value={item.status}
        onChange={(e) => onStatusChange(item.id, e.target.value as StatusDb)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {STATUS_LABEL[opt]}
          </option>
        ))}
      </select>
    </div>
  );
}
