import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { generateReminderMessage, type Urgency } from "@/lib/anthropic";
import { sendWhatsAppMessage } from "@/lib/twilio";
import type { ActionItem } from "@/lib/types";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // tidak ada secret dikonfigurasi, lewati saja (dev)
  return req.headers.get("authorization") === `Bearer ${secret}`;
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
      const message = await generateReminderMessage({
        picNama: item.pic_nama,
        deskripsiTugas: item.deskripsi_tugas,
        deadline: item.deadline,
        urgency,
      });

      await sendWhatsAppMessage(item.pic_nomor_wa, message);

      await query(
        `insert into reminder_logs (action_item_id, pesan_terkirim) values ($1, $2)`,
        [item.id, message]
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
