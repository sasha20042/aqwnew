"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Briefing = {
  title?: string;
  subtitle?: string;
  place?: { label?: string; country?: string; city?: string | null };
  arrival?: { label?: string; time?: string; notes?: string[] };
  documents?: { label?: string; items?: string[]; note?: string };
  contacts?: {
    label?: string;
    coordinator?: { name?: string; role?: string; phone?: string };
    executor?: { name?: string | null; role?: string; phone?: string | null } | null;
  };
};

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
  const [briefing, setBriefing] = useState<Briefing | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setStatus("");
    setBriefing(null);
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
      if (json.status === "accepted" && json.briefing && typeof json.briefing === "object") {
        setBriefing(json.briefing as Briefing);
      }
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
          Ideiglenes <span>védelem</span>
        </div>
        <div className="topbar-meta">Статус</div>
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

            {briefing ? <BriefingCard briefing={briefing} /> : null}

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

function BriefingCard({ briefing }: { briefing: Briefing }) {
  const place = briefing.place;
  const arrival = briefing.arrival;
  const docs = briefing.documents;
  const contacts = briefing.contacts;
  const coordinator = contacts?.coordinator;
  const executor = contacts?.executor;

  return (
    <section className="status-briefing" aria-label="Інформація про подачу">
      <header className="status-briefing__head">
        <p className="status-briefing__eyebrow">Інструкція</p>
        <h2 className="status-briefing__title">
          {briefing.title || "Подача на тимчасовий захист в Угорщині"}
        </h2>
        {briefing.subtitle ? (
          <p className="status-briefing__subtitle">{briefing.subtitle}</p>
        ) : null}
      </header>

      <div className="status-briefing__grid">
        <article className="status-briefing__block">
          <h3>{place?.label || "Місце подачі"}</h3>
          <p className="status-briefing__accent">{place?.country || "Угорщина"}</p>
          {place?.city ? <p className="status-briefing__city">{place.city}</p> : null}
        </article>

        <article className="status-briefing__block">
          <h3>{arrival?.label || "Час прибуття"}</h3>
          <p className="status-briefing__accent">{arrival?.time || "З 08:00 до 09:00"}</p>
          <ul className="status-briefing__list">
            {(arrival?.notes || []).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>

        <article className="status-briefing__block">
          <h3>{docs?.label || "Необхідні документи"}</h3>
          <ul className="status-briefing__list status-briefing__list--docs">
            {(docs?.items || ["Дійсний закордонний паспорт"]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {docs?.note ? <p className="status-briefing__note">{docs.note}</p> : null}
        </article>

        <article className="status-briefing__block status-briefing__block--contacts">
          <h3>{contacts?.label || "Контакти"}</h3>
          {coordinator ? (
            <div className="status-contact">
              <div className="status-contact__name">{coordinator.name}</div>
              <div className="status-contact__role">{coordinator.role}</div>
              {coordinator.phone ? (
                <a className="status-contact__phone" href={`tel:${coordinator.phone.replace(/\s+/g, "")}`}>
                  {coordinator.phone}
                </a>
              ) : null}
            </div>
          ) : null}
          {executor && (executor.name || executor.phone) ? (
            <div className="status-contact">
              <div className="status-contact__name">{executor.name || "Виконавець"}</div>
              <div className="status-contact__role">{executor.role || "Виконавець"}</div>
              {executor.phone ? (
                <a className="status-contact__phone" href={`tel:${executor.phone.replace(/\s+/g, "")}`}>
                  {executor.phone}
                </a>
              ) : null}
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
