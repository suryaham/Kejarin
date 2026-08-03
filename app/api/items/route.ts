import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { ActionItem } from "@/lib/types";

export async function GET() {
  const { rows } = await query<ActionItem>(
    `select id, deskripsi_tugas, pic_nama, pic_nomor_wa,
            to_char(deadline, 'YYYY-MM-DD') as deadline,
            status, dibuat_pada, catatan_rapat
     from action_items
     order by deadline asc, dibuat_pada desc`
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    deskripsi_tugas?: string;
    pic_nama?: string;
    pic_nomor_wa?: string;
    deadline?: string;
    catatan_rapat?: string;
  };

  const { deskripsi_tugas, pic_nama, pic_nomor_wa, deadline, catatan_rapat } = body;

  if (!deskripsi_tugas || !pic_nama || !pic_nomor_wa || !deadline) {
    return NextResponse.json(
      { error: "deskripsi_tugas, pic_nama, pic_nomor_wa, dan deadline wajib diisi" },
      { status: 400 }
    );
  }

  const { rows } = await query<ActionItem>(
    `insert into action_items (deskripsi_tugas, pic_nama, pic_nomor_wa, deadline, catatan_rapat)
     values ($1, $2, $3, $4, $5)
     returning id, deskripsi_tugas, pic_nama, pic_nomor_wa,
               to_char(deadline, 'YYYY-MM-DD') as deadline,
               status, dibuat_pada, catatan_rapat`,
    [deskripsi_tugas, pic_nama, pic_nomor_wa, deadline, catatan_rapat ?? null]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
