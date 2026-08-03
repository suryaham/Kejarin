export type StatusDb = "belum_mulai" | "berjalan" | "selesai";
export type StatusPapan = "belum_mulai" | "berjalan" | "selesai" | "overdue";

export interface ActionItem {
  id: string;
  deskripsi_tugas: string;
  pic_nama: string;
  pic_nomor_wa: string;
  deadline: string; // ISO date (yyyy-mm-dd)
  status: StatusDb;
  dibuat_pada: string;
  catatan_rapat: string | null;
}

export interface ReminderLog {
  id: string;
  action_item_id: string;
  pesan_terkirim: string;
  terkirim_pada: string;
}

export function statusPapan(item: Pick<ActionItem, "status" | "deadline">): StatusPapan {
  if (item.status === "selesai") return "selesai";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(item.deadline);
  deadline.setHours(0, 0, 0, 0);
  if (deadline.getTime() < today.getTime()) return "overdue";
  return item.status;
}
