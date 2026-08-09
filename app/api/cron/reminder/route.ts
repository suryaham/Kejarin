import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendWhatsAppTemplateMessage } from "@/lib/twilio";
import type { ActionItem } from "@/lib/types";

type Urgency = "h_minus_1" | "overdue";

const TEMPLATE_BODY: Record<Urgency, string> = {
  h_minus_1:
    'Halo {{1}}, ini pengingat untuk tugas "{{2}}". Deadline-nya besok, {{3}}. Mohon segera diselesaikan ya. Terima kasih!',
  overdue:
    'Halo {{1}}, tugas "{{2}}" sudah melewati deadline ({{3}}) dan statusnya belum selesai. Mohon segera diselesaikan atau infokan kendalanya. Terima kasih!',
};

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // tidak ada secret dikonfigurasi, lewati saja (dev)
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function templateSidFor(urgency: Urgency): string {
  const envKey = urgency === "h_minus_1" ? "TWILIO_TEMPLATE_SID_H1" : "TWILIO_TEMPLATE_SID_OVERDUE";
  const sid = process.env[envKey];
  if (!sid) {
    throw new Error(`${envKey} belum diset. Lihat .env.example.`);
  }
  return sid;
}

function formatDeadlineId(deadline: string): string {
  return new Date(deadline).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fillTemplate(urgency: Urgency, vars: Record<string, string>): string {
  return TEMPLATE_BODY[urgency]
    .replace("{{1}}", vars["1"])
    .replace("{{2}}", vars["2"])
    .replace("{{3}}", vars["3"]);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows: items } = await query<ActionItem>(
    `select id, deskripsi_tugas, pic_nama, pic_nomor_wa,
            to_char(deadline, 'YYYY-MM-DD') as deadline,
            status, dibuat_pada, catatan_rapat
     from action_items
     where status <> 'selesai'
       and deadline <= (current_date + interval '1 day')`
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results: { id: string; sent: boolean; error?: string }[] = [];

  for (const item of items) {
    const deadline = new Date(item.deadline);
    deadline.setHours(0, 0, 0, 0);
    const urgency: Urgency = deadline.getTime() < today.getTime() ? "overdue" : "h_minus_1";

    try {
      const contentVariables = {
        "1": item.pic_nama,
        "2": item.deskripsi_tugas,
        "3": formatDeadlineId(item.deadline),
      };

      await sendWhatsAppTemplateMessage({
        nomorTujuan: item.pic_nomor_wa,
        contentSid: templateSidFor(urgency),
        contentVariables,
      });

      await query(
        `insert into reminder_logs (action_item_id, pesan_terkirim) values ($1, $2)`,
        [item.id, fillTemplate(urgency, contentVariables)]
      );

      results.push({ id: item.id, sent: true });
    } catch (err) {
      console.error(`gagal mengirim reminder untuk item ${item.id}`, err);
      results.push({
        id: item.id,
        sent: false,
        error: err instanceof Error ? err.message : "unknown error",
      });
    }
  }

  return NextResponse.json({ checked: items.length, results });
}
