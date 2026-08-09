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
