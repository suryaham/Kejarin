import { GoogleGenAI, Type } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-flash-latest";

export interface ExtractedActionItem {
  pic: string;
  deskripsi_tugas: string;
  deadline: string; // ISO date yyyy-mm-dd
}

export async function extractActionItem(
  text: string,
  todayIso: string
): Promise<ExtractedActionItem> {
  const response = await client.models.generateContent({
    model: MODEL,
    contents: text,
    config: {
      systemInstruction: `Kamu membantu manager mengekstrak action item dari catatan rapat berbahasa Indonesia.
Tanggal hari ini adalah ${todayIso}. Konversikan deadline relatif (mis. "Jumat depan", "besok", "minggu depan") menjadi tanggal aktual (YYYY-MM-DD) berdasarkan tanggal hari ini itu.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pic: { type: Type.STRING, description: "Nama penanggung jawab tugas" },
          deskripsi_tugas: {
            type: Type.STRING,
            description: "Deskripsi singkat tugas yang harus dikerjakan",
          },
          deadline: {
            type: Type.STRING,
            description: "Tanggal deadline dalam format YYYY-MM-DD",
          },
        },
        required: ["pic", "deskripsi_tugas", "deadline"],
      },
      maxOutputTokens: 1024,
    },
  });

  const text_ = response.text;
  if (!text_) {
    throw new Error("Gemini API tidak mengembalikan hasil ekstraksi");
  }
  return JSON.parse(text_) as ExtractedActionItem;
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

  const response = await client.models.generateContent({
    model: MODEL,
    contents: `PIC: ${picNama}\nTugas: ${deskripsiTugas}\nDeadline: ${deadline}`,
    config: {
      systemInstruction: `Kamu menulis pesan pengingat WhatsApp singkat (2-4 kalimat) dalam Bahasa Indonesia untuk PIC tugas rapat. ${nadaInstruksi}
Sertakan nama PIC, deskripsi tugas, dan deadline. Jangan pakai salam pembuka formal berlebihan. Balas hanya dengan isi pesannya, tanpa embel-embel lain.`,
      maxOutputTokens: 300,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini API tidak mengembalikan pesan pengingat");
  }
  return text.trim();
}
