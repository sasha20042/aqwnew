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
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${crmUrl}/api/public/hungary-tz/status`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Public-Form-Key": apiKey,
      },
      body: JSON.stringify({ phone: body?.phone ?? "" }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({
      ok: false,
      message: "Помилка відповіді CRM",
    }));

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Не вдалося звʼязатися з CRM." },
      { status: 502 },
    );
  }
}
