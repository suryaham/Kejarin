import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MODEL = "claude-opus-5";

export interface ExtractedActionItem {
  pic: string;
  deskripsi_tugas: string;
  deadline: string; // ISO date yyyy-mm-dd
}

const EXTRACT_SCHEMA = {
  type: "object" as const,
  properties: {
    pic: { type: "string", description: "Nama penanggung jawab tugas" },
    deskripsi_tugas: { type: "string", description: "Deskripsi singkat tugas yang harus dikerjakan" },
    deadline: {
      type: "string",
      description: "Tanggal deadline dalam format YYYY-MM-DD",
      format: "date",
    },
  },
  required: ["pic", "deskripsi_tugas", "deadline"],
  additionalProperties: false,
};

export async function extractActionItem(
  text: string,
  todayIso: string
): Promise<ExtractedActionItem> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "disabled" },
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: EXTRACT_SCHEMA },
    },
    system: `Kamu membantu manager mengekstrak action item dari catatan rapat berbahasa Indonesia.
Tanggal hari ini adalah ${todayIso}. Konversikan deadline relatif (mis. "Jumat depan", "besok", "minggu depan") menjadi tanggal aktual (YYYY-MM-DD) berdasarkan tanggal hari ini itu.`,
    messages: [{ role: "user", content: text }],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Anthropic API tidak mengembalikan hasil ekstraksi");
  }
  return JSON.parse(block.text) as ExtractedActionItem;
}

export type Urgency = "h_minus_1" | "overdue";

export async function generateReminderMessage(params: {
  picNama: string;
  deskripsiTugas: string;
  deadline: string;
  urgency: Urgency;
}): Promise<string> {
  const { picNama, deskripsiTugas, deadline, urgency } = params;

  const nadaInstruksi =
    urgency === "h_minus_1"
      ? "Nada pesan santai dan ramah, mengingatkan bahwa deadline besok."
      : "Nada pesan lebih tegas dan mendesak, karena deadline sudah lewat dan tugas belum selesai.";

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    thinking: { type: "disabled" },
    output_config: { effort: "low" },
    system: `Kamu menulis pesan pengingat WhatsApp singkat (2-4 kalimat) dalam Bahasa Indonesia untuk PIC tugas rapat. ${nadaInstruksi}
Sertakan nama PIC, deskripsi tugas, dan deadline. Jangan pakai salam pembuka formal berlebihan. Balas hanya dengan isi pesannya, tanpa embel-embel lain.`,
    messages: [
      {
        role: "user",
        content: `PIC: ${picNama}\nTugas: ${deskripsiTugas}\nDeadline: ${deadline}`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Anthropic API tidak mengembalikan pesan pengingat");
  }
  return block.text.trim();
}
