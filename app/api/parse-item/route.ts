import { NextRequest, NextResponse } from "next/server";
import { extractActionItem } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { text } = (await req.json()) as { text?: string };

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Teks tidak boleh kosong" }, { status: 400 });
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  try {
    const result = await extractActionItem(text, todayIso);
    return NextResponse.json(result);
  } catch (err) {
    console.error("parse-item error", err);
    return NextResponse.json(
      { error: "Gagal mengekstrak action item dari teks" },
      { status: 502 }
    );
  }
}
