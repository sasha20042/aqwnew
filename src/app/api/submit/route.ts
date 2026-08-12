import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const crmUrl = process.env.CRM_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.CRM_API_KEY;

  if (!crmUrl || !apiKey) {
    return NextResponse.json(
      { ok: false, message: "Сервер форми не налаштовано (CRM_API_URL / CRM_API_KEY)." },
      { status: 503 },
    );
  }

  try {
    const incoming = await req.formData();
    const outgoing = new FormData();

    for (const [key, value] of incoming.entries()) {
      outgoing.append(key, value);
    }

    const res = await fetch(`${crmUrl}/api/public/hungary-tz`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "X-Public-Form-Key": apiKey,
      },
      body: outgoing,
    });

    const data = await res.json().catch(() => ({
      message: "Помилка відповіді CRM",
    }));

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Не вдалося надіслати анкету в CRM." },
      { status: 502 },
    );
  }
}
