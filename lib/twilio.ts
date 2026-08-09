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

function toE164(nomor: string): string {
  const trimmed = nomor.trim();
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

export async function sendReminderSms(nomorTujuan: string, body: string) {
  const from = process.env.TWILIO_SMS_FROM;
  if (!from) {
    throw new Error("TWILIO_SMS_FROM belum diset. Lihat .env.example.");
  }
  const c = getClient();
  return c.messages.create({
    from: toE164(from),
    to: toE164(nomorTujuan),
    body,
  });
}
