"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function StatusClient() {
  const search = useSearchParams();
  const backHref = useMemo(() => {
    const t = search.get("t");
    return t && t.trim() !== "" ? `/?t=${encodeURIComponent(t.trim())}` : "/";
  }, [search]);

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"accepted" | "processing" | "">("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setStatus("");
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.message || "Не вдалося перевірити статус.");
        return;
      }
      setMessage(typeof json.message === "string" ? json.message : "Готово.");
      setStatus(json.status === "accepted" ? "accepted" : "processing");
    } catch {
      setError("Не вдалося звʼязатися з сервером.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand">
          AQW <span>Legal</span>
        </div>
        <div style={{ color: "var(--muted)", fontSize: "0.85rem", fontWeight: 600 }}>
          Статус анкети
        </div>
      </div>

      <div className="stage">
        <div className="card">
          <div className="kicker">Перевірка</div>
          <h1 className="title">Статус анкети</h1>
          <p className="lead">
            Введіть номер телефону, який вказували в анкеті на Угорський тимчасовий захист.
          </p>

          <form onSubmit={onSubmit} className="grid" style={{ gap: "0.85rem" }}>
            <div className="field">
              <label>
                <span>Номер телефону</span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+380..."
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </div>

            {error ? (
              <div className="banner banner-error" style={{ whiteSpace: "pre-line" }}>
                {error}
              </div>
            ) : null}

            {message ? (
              <div
                className={`banner ${status === "accepted" ? "banner-ok" : "banner-info"}`}
                style={{ whiteSpace: "pre-line" }}
              >
                {message}
              </div>
            ) : null}

            <div className="actions">
              <Link href={backHref} className="btn btn-ghost">
                Назад
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || phone.replace(/\D/g, "").length < 9}
              >
                {loading ? "Перевіряємо…" : "Перевірити"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
