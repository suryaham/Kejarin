import twilio from "twilio";

let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      throw new Error(
        "TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN belum diset. Lihat .env.example."
      );
    }
    client = twilio(sid, token);
  }
  return client;
}

function toWhatsAppAddress(nomor: string): string {
  const trimmed = nomor.trim();
  return trimmed.startsWith("whatsapp:") ? trimmed : `whatsapp:+${trimmed.replace(/^\+/, "")}`;
}

export async function sendWhatsAppTemplateMessage(params: {
  nomorTujuan: string;
  contentSid: string;
  contentVariables: Record<string, string>;
}) {
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) {
    throw new Error("TWILIO_WHATSAPP_FROM belum diset. Lihat .env.example.");
  }
  const c = getClient();
  return c.messages.create({
    from: toWhatsAppAddress(from),
    to: toWhatsAppAddress(params.nomorTujuan),
    contentSid: params.contentSid,
    contentVariables: JSON.stringify(params.contentVariables),
  });
}
