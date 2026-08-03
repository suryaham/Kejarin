import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { ActionItem, StatusDb } from "@/lib/types";

const VALID_STATUS: StatusDb[] = ["belum_mulai", "berjalan", "selesai"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = (await req.json()) as { status?: string };

  if (!status || !VALID_STATUS.includes(status as StatusDb)) {
    return NextResponse.json(
      { error: `status harus salah satu dari: ${VALID_STATUS.join(", ")}` },
      { status: 400 }
    );
  }

  const { rows } = await query<ActionItem>(
    `update action_items set status = $1 where id = $2
     returning id, deskripsi_tugas, pic_nama, pic_nomor_wa,
               to_char(deadline, 'YYYY-MM-DD') as deadline,
               status, dibuat_pada, catatan_rapat`,
    [status, id]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}
