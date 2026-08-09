"use client";

import { useState } from "react";
import { Calendar, Pencil, Check, X } from "lucide-react";
import type { ActionItem, StatusDb, StatusPapan } from "@/lib/types";
import { COLUMN_STYLES, STATUS_LABEL, avatarColorFor } from "@/lib/statusStyles";

const STATUS_OPTIONS: StatusDb[] = ["belum_mulai", "berjalan", "selesai"];

export interface ItemEditPatch {
  deskripsi_tugas: string;
  pic_nama: string;
  pic_nomor_wa: string;
  deadline: string;
}

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
  onEdit,
}: {
  item: ActionItem;
  columnStatus: StatusPapan;
  onStatusChange: (id: string, status: StatusDb) => void;
  onEdit: (id: string, patch: ItemEditPatch) => void;
}) {
  const style = COLUMN_STYLES[columnStatus];
  const initial = item.pic_nama.trim().charAt(0).toUpperCase() || "?";

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ItemEditPatch>({
    deskripsi_tugas: item.deskripsi_tugas,
    pic_nama: item.pic_nama,
    pic_nomor_wa: item.pic_nomor_wa,
    deadline: item.deadline,
  });

  function startEdit() {
    setDraft({
      deskripsi_tugas: item.deskripsi_tugas,
      pic_nama: item.pic_nama,
      pic_nomor_wa: item.pic_nomor_wa,
      deadline: item.deadline,
    });
    setIsEditing(true);
  }

  function handleSave() {
    if (!draft.deskripsi_tugas.trim() || !draft.pic_nama.trim() || !draft.pic_nomor_wa.trim() || !draft.deadline) {
      return;
    }
    onEdit(item.id, {
      deskripsi_tugas: draft.deskripsi_tugas.trim(),
      pic_nama: draft.pic_nama.trim(),
      pic_nomor_wa: draft.pic_nomor_wa.trim(),
      deadline: draft.deadline,
    });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className={`rounded-xl border-l-4 ${style.cardAccent} bg-white p-3.5 shadow-sm dark:bg-zinc-900`}>
        <div className="flex flex-col gap-2">
          <textarea
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            rows={2}
            value={draft.deskripsi_tugas}
            onChange={(e) => setDraft({ ...draft, deskripsi_tugas: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              className="w-1/2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Nama PIC"
              value={draft.pic_nama}
              onChange={(e) => setDraft({ ...draft, pic_nama: e.target.value })}
            />
            <input
              className="w-1/2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="62812xxxxxxx"
              value={draft.pic_nomor_wa}
              onChange={(e) => setDraft({ ...draft, pic_nomor_wa: e.target.value })}
            />
          </div>
          <input
            type="date"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={draft.deadline}
            onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
          />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <X size={13} />
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            <Check size={13} />
            Simpan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative rounded-xl border-l-4 ${style.cardAccent} bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900`}
    >
      <button
        onClick={startEdit}
        className="absolute right-2.5 top-2.5 rounded-full p-1 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-700 group-hover:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        title="Edit item"
      >
        <Pencil size={13} />
      </button>

      <p className="pr-6 text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
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
