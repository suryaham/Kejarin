import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { ActionItem, StatusDb } from "@/lib/types";

const VALID_STATUS: StatusDb[] = ["belum_mulai", "berjalan", "selesai"];
const DEADLINE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface PatchBody {
  status?: string;
  deskripsi_tugas?: string;
  pic_nama?: string;
  pic_nomor_wa?: string;
  deadline?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as PatchBody;

  if (body.status !== undefined && !VALID_STATUS.includes(body.status as StatusDb)) {
    return NextResponse.json(
      { error: `status harus salah satu dari: ${VALID_STATUS.join(", ")}` },
      { status: 400 }
    );
  }
  if (body.deadline !== undefined && !DEADLINE_RE.test(body.deadline)) {
    return NextResponse.json({ error: "deadline harus format YYYY-MM-DD" }, { status: 400 });
  }
  for (const field of ["deskripsi_tugas", "pic_nama", "pic_nomor_wa"] as const) {
    if (body[field] !== undefined && !body[field]!.trim()) {
      return NextResponse.json({ error: `${field} tidak boleh kosong` }, { status: 400 });
    }
  }

  const columns: Record<string, string> = {
    status: "status",
    deskripsi_tugas: "deskripsi_tugas",
    pic_nama: "pic_nama",
    pic_nomor_wa: "pic_nomor_wa",
    deadline: "deadline",
  };

  const sets: string[] = [];
  const values: string[] = [];
  for (const [key, column] of Object.entries(columns)) {
    const value = body[key as keyof PatchBody];
    if (value !== undefined) {
      values.push(value.trim());
      sets.push(`${column} = $${values.length}`);
    }
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: "Tidak ada field yang diubah" }, { status: 400 });
  }

  values.push(id);

  const { rows } = await query<ActionItem>(
    `update action_items set ${sets.join(", ")} where id = $${values.length}
     returning id, deskripsi_tugas, pic_nama, pic_nomor_wa,
               to_char(deadline, 'YYYY-MM-DD') as deadline,
               status, dibuat_pada, catatan_rapat`,
    values
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}
