import type { ActionItem } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/statusStyles";
import { statusPapan } from "@/lib/types";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadItemsAsExcel(items: ActionItem[]) {
  const header = ["PIC", "Nomor WhatsApp", "Deskripsi Tugas", "Deadline", "Status", "Catatan Rapat"];
  const rows = items.map((item) => [
    item.pic_nama,
    item.pic_nomor_wa,
    item.deskripsi_tugas,
    item.deadline,
    statusPapan(item) === "overdue" ? "Overdue" : STATUS_LABEL[item.status],
    item.catatan_rapat ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
    .join("\r\n");

  const blob = new Blob(["﻿" + csv], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `kejarin-action-items-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
