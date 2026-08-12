import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const crmUrl = process.env.CRM_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.CRM_API_KEY;

  if (!crmUrl || !apiKey) {
    return NextResponse.json(
      { ok: false, message: "Сервер форми не налаштовано (CRM_API_URL / CRM_API_KEY)." },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${crmUrl}/api/public/hungary-tz/invite/${encodeURIComponent(token)}`, {
      headers: {
        Accept: "application/json",
        "X-Public-Form-Key": apiKey,
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Не вдалося звʼязатися з CRM." },
      { status: 502 },
    );
  }
}
