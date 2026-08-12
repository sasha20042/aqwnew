import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const crmUrl = process.env.CRM_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.CRM_API_KEY;

  if (!crmUrl || !apiKey) {
    return NextResponse.json(
      {
        ok: false,
        message: "Сервер форми не налаштовано (CRM_API_URL / CRM_API_KEY).",
      },
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

    const raw = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      data = {
        message:
          res.status >= 500
            ? `Помилка сервера CRM (${res.status}).`
            : "CRM повернув некоректну відповідь.",
      };
    }

    if (!res.ok && !data.message && !data.errors) {
      data.message = `Не вдалося надіслати анкету (код ${res.status}).`;
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "";
    return NextResponse.json(
      {
        ok: false,
        message: detail
          ? `Не вдалося звʼязатися з CRM: ${detail}`
          : "Не вдалося надіслати анкету в CRM.",
      },
      { status: 502 },
    );
  }
}
