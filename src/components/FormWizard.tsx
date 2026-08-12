"use client";

import { useEffect, useMemo, useState } from "react";
import {
  emptyForm,
  FormDataState,
  hasCyrillic,
  isLatin,
} from "@/lib/form";

type PhotoItem = { id: string; file: File; url: string };

const STEPS = [
  "start",
  "identity",
  "birth",
  "docs",
  "survey1",
  "survey2",
  "photos",
  "review",
  "done",
] as const;

type Step = (typeof STEPS)[number];

const sexOptions = [
  { value: "male", label: "Чоловік" },
  { value: "female", label: "Жінка" },
] as const;

const maritalOptions = [
  { value: "single", label: "Неодружений(а)" },
  { value: "married", label: "Одружений(а)" },
  { value: "divorced", label: "Розлучений(а)" },
  { value: "widowed", label: "Вдівець / вдова" },
  { value: "partner", label: "Цивільний шлюб" },
] as const;

const yesNo = [
  { value: "yes", label: "Так" },
  { value: "no", label: "Ні" },
] as const;

const routeOptions = [
  { value: "car", label: "Автомобілем" },
  { value: "train", label: "Потягом" },
  { value: "bus", label: "Автобусом" },
  { value: "plane", label: "Літаком" },
  { value: "other", label: "Інше" },
] as const;

const crossingOptions = [
  {
    value: "official_no_stamp",
    label: "Офіційний ПП, але немає печатки",
  },
  {
    value: "unofficial_forest_river",
    label: "Неофіційний перетин (ліс / річка)",
  },
  { value: "other", label: "Інше" },
] as const;

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`field ${error ? "error" : ""}`}>
      <label>
        <span>{label}</span>
        {hint ? <span className="hint">{hint}</span> : null}
      </label>
      {children}
      {error ? <div className="err">{error}</div> : null}
    </div>
  );
}

function ChoiceGroup<T extends string>({
  value,
  options,
  onChange,
  row = false,
}: {
  value: T | "";
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
  row?: boolean;
}) {
  return (
    <div className={`choice-grid ${row ? "choice-row" : ""}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`choice ${value === o.value ? "active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function FormWizard({ token }: { token: string | null }) {
  const [step, setStep] = useState<Step>("start");
  const [inviteState, setInviteState] = useState<
    "loading" | "ok" | "bad" | "missing"
  >(token ? "loading" : "missing");
  const [inviteError, setInviteError] = useState("");
  const [data, setData] = useState<FormDataState>(emptyForm);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/invite/${encodeURIComponent(token)}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.ok) {
          setInviteState("bad");
          setInviteError(json.message || "Посилання недоступне.");
          return;
        }
        setInviteState("ok");
      } catch {
        if (!cancelled) {
          setInviteState("bad");
          setInviteError("Не вдалося перевірити посилання.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = useMemo(() => {
    const idx = Math.max(0, STEPS.indexOf(step));
    const usable = STEPS.length - 1;
    return Math.round((idx / usable) * 100);
  }, [step]);

  function setField<K extends keyof FormDataState>(key: K, value: FormDataState[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateLatinKeys(keys: (keyof FormDataState)[]) {
    const next: Record<string, string> = {};
    for (const key of keys) {
      const val = String(data[key] ?? "");
      if (!val.trim()) continue;
      if (key === "current_address" || key === "document_type" || key === "document_number") {
        if (hasCyrillic(val)) next[key] = "Лише латиниця, без кирилиці.";
      } else if (!isLatin(val)) {
        next[key] = "Лише латинські літери (A–Z).";
      }
    }
    return next;
  }

  function validateStep(current: Step): boolean {
    const next: Record<string, string> = {};
    if (current === "identity") {
      if (!data.full_name_latin.trim()) next.full_name_latin = "Обовʼязкове поле.";
      Object.assign(next, validateLatinKeys(["full_name_latin", "maiden_name_latin", "mother_maiden_name_latin"]));
      if (data.phone && data.phone.replace(/\D/g, "").length < 8) {
        next.phone = "Перевірте номер телефону.";
      }
    }
    if (current === "birth") {
      Object.assign(next, validateLatinKeys(["nationality", "country_of_birth", "place_of_birth"]));
    }
    if (current === "docs") {
      Object.assign(next, validateLatinKeys(["document_type", "document_number", "current_address"]));
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        next.email = "Некоректна електронна пошта.";
      }
    }
    if (current === "survey1") {
      if (!data.has_foreign_passport) next.has_foreign_passport = "Оберіть відповідь.";
      if (!data.has_direct_border_stamp) next.has_direct_border_stamp = "Оберіть відповідь.";
    }
    if (current === "survey2" && data.has_direct_border_stamp === "no") {
      if (!data.left_via_other_country) next.left_via_other_country = "Оберіть відповідь.";
      if (data.left_via_other_country === "yes") {
        if (!data.exit_ukraine_date) next.exit_ukraine_date = "Вкажіть дату.";
        if (!data.via_other_country_name.trim()) next.via_other_country_name = "Вкажіть країну.";
        if (!data.route_to_hungary) next.route_to_hungary = "Оберіть шлях.";
        if (data.route_to_hungary === "other" && !data.route_to_hungary_other.trim()) {
          next.route_to_hungary_other = "Уточніть шлях.";
        }
        if (!data.enter_hungary_date) next.enter_hungary_date = "Вкажіть дату.";
      }
      if (!data.official_ukraine_crossing) next.official_ukraine_crossing = "Оберіть відповідь.";
      if (data.unofficial_crossing_situation && !data.crossing_situation_explanation.trim()) {
        next.crossing_situation_explanation = "Додайте коротке пояснення.";
      }
    }
    if (current === "photos" && photos.length < 1) {
      next.photos = "Додайте хоча б одне фото документа.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function nextStep() {
    if (!validateStep(step)) return;
    const idx = STEPS.indexOf(step);
    let next = STEPS[Math.min(idx + 1, STEPS.length - 1)];
    if (step === "survey1" && data.has_direct_border_stamp === "yes") {
      next = "photos";
    }
    setStep(next);
  }

  function prevStep() {
    const idx = STEPS.indexOf(step);
    let prev = STEPS[Math.max(idx - 1, 0)];
    if (step === "photos" && data.has_direct_border_stamp === "yes") {
      prev = "survey1";
    }
    setStep(prev);
  }

  function onPickPhotos(files: FileList | null) {
    if (!files?.length) return;
    const incoming = Array.from(files).slice(0, 12 - photos.length);
    const mapped = incoming.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...mapped].slice(0, 12));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.photos;
      return next;
    });
  }

  function movePhoto(index: number, dir: -1 | 1) {
    setPhotos((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function submit() {
    if (!token) return;
    if (!validateStep("photos") && photos.length < 1) {
      setStep("photos");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const fd = new FormData();
      fd.append("token", token);
      fd.append("residence_country", data.residence_country || "Угорщина");
      const qKeys: (keyof FormDataState)[] = [
        "full_name_latin",
        "phone",
        "maiden_name_latin",
        "mother_maiden_name_latin",
        "date_of_birth",
        "sex",
        "marital_status",
        "nationality",
        "country_of_birth",
        "place_of_birth",
        "document_type",
        "document_number",
        "email",
        "current_address",
        "has_foreign_passport",
        "has_direct_border_stamp",
        "left_via_other_country",
        "exit_ukraine_date",
        "via_other_country_name",
        "route_to_hungary",
        "route_to_hungary_other",
        "enter_hungary_date",
        "official_ukraine_crossing",
        "unofficial_crossing_situation",
        "crossing_situation_explanation",
      ];
      for (const key of qKeys) {
        fd.append(`hungary_questionnaire[${key}]`, String(data[key] ?? ""));
      }
      photos.forEach((p) => fd.append("photos[]", p.file));

      const res = await fetch("/api/submit", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json.message ||
          (json.errors
            ? Object.values(json.errors as Record<string, string[]>)
                .flat()
                .join("\n")
            : "Не вдалося надіслати анкету.");
        throw new Error(msg);
      }
      setStep("done");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Помилка надсилання");
    } finally {
      setSubmitting(false);
    }
  }

  if (inviteState === "loading") {
    return <div className="loading">Перевіряємо посилання…</div>;
  }

  if (inviteState === "missing" || inviteState === "bad") {
    return (
      <div className="shell">
        <div className="stage">
          <div className="card">
            <div className="kicker">Доступ</div>
            <h1 className="title">Потрібне персональне посилання</h1>
            <p className="lead">
              {inviteError ||
                "Відкрийте анкету лише за посиланням від вашого менеджера. Без токена форма недоступна."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand">
          AQW <span>Legal</span>
        </div>
        <div style={{ color: "var(--muted)", fontSize: "0.85rem", fontWeight: 600 }}>
          Угорщина · ТЗ
        </div>
      </div>
      {step !== "done" ? (
        <div className="progress-track" aria-hidden>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <div className="stage">
        <div className="card" key={step}>
          {step === "start" && (
            <>
              <div className="kicker">Онлайн-анкета</div>
              <h1 className="title">Тимчасовий захист в Угорщині</h1>
              <p className="lead">
                Заповніть дані латиницею, пройдіть коротке опитування та додайте
                фото документів у правильному порядку. Менеджер перевірить анкету
                після надсилання.
              </p>
              <div className="actions">
                <button type="button" className="btn btn-primary" onClick={() => setStep("identity")}>
                  Почати
                </button>
              </div>
            </>
          )}

          {step === "identity" && (
            <>
              <div className="kicker">Крок 1 · Особа</div>
              <h2 className="title">Хто ви?</h2>
              <p className="lead">ПІБ — латиницею, як у закордонному паспорті.</p>
              <div className="grid grid-2">
                <Field label="Прізвище та імʼя *" hint="латиниця" error={errors.full_name_latin}>
                  <input
                    value={data.full_name_latin}
                    onChange={(e) => setField("full_name_latin", e.target.value)}
                    placeholder="Taras Shevchenko"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Телефон" error={errors.phone}>
                  <input
                    value={data.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="+380..."
                    inputMode="tel"
                  />
                </Field>
                <Field label="Дівоче прізвище та імʼя" hint="латиниця" error={errors.maiden_name_latin}>
                  <input
                    value={data.maiden_name_latin}
                    onChange={(e) => setField("maiden_name_latin", e.target.value)}
                  />
                </Field>
                <Field
                  label="Дівоче прізвище та імʼя матері"
                  hint="латиниця"
                  error={errors.mother_maiden_name_latin}
                >
                  <input
                    value={data.mother_maiden_name_latin}
                    onChange={(e) => setField("mother_maiden_name_latin", e.target.value)}
                  />
                </Field>
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  Назад
                </button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Далі
                </button>
              </div>
            </>
          )}

          {step === "birth" && (
            <>
              <div className="kicker">Крок 2 · Народження</div>
              <h2 className="title">Дата, стать, громадянство</h2>
              <div className="grid grid-2">
                <Field label="Дата народження">
                  <input
                    type="date"
                    value={data.date_of_birth}
                    onChange={(e) => setField("date_of_birth", e.target.value)}
                  />
                </Field>
                <Field label="Стать">
                  <ChoiceGroup
                    value={data.sex}
                    options={sexOptions}
                    onChange={(v) => setField("sex", v)}
                    row
                  />
                </Field>
                <Field label="Сімейний стан">
                  <select
                    value={data.marital_status}
                    onChange={(e) =>
                      setField("marital_status", e.target.value as FormDataState["marital_status"])
                    }
                  >
                    <option value="">—</option>
                    {maritalOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Громадянство" hint="латиниця" error={errors.nationality}>
                  <input
                    value={data.nationality}
                    onChange={(e) => setField("nationality", e.target.value)}
                    placeholder="Ukrainian"
                  />
                </Field>
                <Field label="Країна народження" hint="латиниця" error={errors.country_of_birth}>
                  <input
                    value={data.country_of_birth}
                    onChange={(e) => setField("country_of_birth", e.target.value)}
                    placeholder="Ukraine"
                  />
                </Field>
                <Field label="Місце народження (місто)" hint="латиниця" error={errors.place_of_birth}>
                  <input
                    value={data.place_of_birth}
                    onChange={(e) => setField("place_of_birth", e.target.value)}
                  />
                </Field>
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  Назад
                </button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Далі
                </button>
              </div>
            </>
          )}

          {step === "docs" && (
            <>
              <div className="kicker">Крок 3 · Документ і контакти</div>
              <h2 className="title">Паспорт і адреса</h2>
              <div className="grid grid-2">
                <Field label="Тип документа" hint="латиниця" error={errors.document_type}>
                  <input
                    value={data.document_type}
                    onChange={(e) => setField("document_type", e.target.value)}
                    placeholder="Passport"
                  />
                </Field>
                <Field label="Номер документа" error={errors.document_number}>
                  <input
                    value={data.document_number}
                    onChange={(e) => setField("document_number", e.target.value)}
                  />
                </Field>
                <Field label="Електронна пошта" error={errors.email}>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="name@email.com"
                  />
                </Field>
                <Field label="Країна перебування">
                  <input
                    value={data.residence_country}
                    onChange={(e) => setField("residence_country", e.target.value)}
                  />
                </Field>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Поточна адреса" hint="латиниця" error={errors.current_address}>
                    <input
                      value={data.current_address}
                      onChange={(e) => setField("current_address", e.target.value)}
                      placeholder="City, street, house..."
                    />
                  </Field>
                </div>
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  Назад
                </button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Далі
                </button>
              </div>
            </>
          )}

          {step === "survey1" && (
            <>
              <div className="kicker">Опитування · 1–2</div>
              <h2 className="title">Паспорт і штамп</h2>
              <div className="grid">
                <Field
                  label="Чи є у вас дійсний закордонний паспорт?"
                  error={errors.has_foreign_passport}
                >
                  <ChoiceGroup
                    value={data.has_foreign_passport}
                    options={yesNo}
                    onChange={(v) => setField("has_foreign_passport", v)}
                    row
                  />
                </Field>
                <Field
                  label="Чи є офіційний штамп прямого перетину Україна — Угорщина?"
                  error={errors.has_direct_border_stamp}
                >
                  <ChoiceGroup
                    value={data.has_direct_border_stamp}
                    options={yesNo}
                    onChange={(v) => setField("has_direct_border_stamp", v)}
                    row
                  />
                </Field>
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  Назад
                </button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Далі
                </button>
              </div>
            </>
          )}

          {step === "survey2" && (
            <>
              <div className="kicker">Опитування · 3–4</div>
              <h2 className="title">Маршрут і обставини</h2>
              <div className="grid">
                <Field
                  label="Чи виїжджали спочатку до іншої країни ЄС (напр. Польща / Словаччина)?"
                  error={errors.left_via_other_country}
                >
                  <ChoiceGroup
                    value={data.left_via_other_country}
                    options={yesNo}
                    onChange={(v) => setField("left_via_other_country", v)}
                    row
                  />
                </Field>

                {data.left_via_other_country === "yes" && (
                  <div className="grid grid-2">
                    <Field label="Дата виїзду" error={errors.exit_ukraine_date}>
                      <input
                        type="date"
                        value={data.exit_ukraine_date}
                        onChange={(e) => setField("exit_ukraine_date", e.target.value)}
                      />
                    </Field>
                    <Field label="Яка країна" error={errors.via_other_country_name}>
                      <input
                        value={data.via_other_country_name}
                        onChange={(e) => setField("via_other_country_name", e.target.value)}
                      />
                    </Field>
                    <Field label="Шлях до Угорщини" error={errors.route_to_hungary}>
                      <ChoiceGroup
                        value={data.route_to_hungary}
                        options={routeOptions}
                        onChange={(v) => setField("route_to_hungary", v)}
                      />
                    </Field>
                    {data.route_to_hungary === "other" && (
                      <Field label="Інше (уточніть)" error={errors.route_to_hungary_other}>
                        <input
                          value={data.route_to_hungary_other}
                          onChange={(e) => setField("route_to_hungary_other", e.target.value)}
                        />
                      </Field>
                    )}
                    <Field label="Дата вʼїзду до Угорщини" error={errors.enter_hungary_date}>
                      <input
                        type="date"
                        value={data.enter_hungary_date}
                        onChange={(e) => setField("enter_hungary_date", e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                <Field
                  label="Чи офіційно перетинали український кордон?"
                  error={errors.official_ukraine_crossing}
                >
                  <ChoiceGroup
                    value={data.official_ukraine_crossing}
                    options={yesNo}
                    onChange={(v) => setField("official_ukraine_crossing", v)}
                    row
                  />
                </Field>
                <Field label="Якщо немає печатки / нестандартний перетин — оберіть ситуацію">
                  <ChoiceGroup
                    value={data.unofficial_crossing_situation}
                    options={crossingOptions}
                    onChange={(v) => setField("unofficial_crossing_situation", v)}
                  />
                </Field>
                {data.unofficial_crossing_situation && (
                  <Field label="Пояснення" error={errors.crossing_situation_explanation}>
                    <textarea
                      rows={3}
                      value={data.crossing_situation_explanation}
                      onChange={(e) => setField("crossing_situation_explanation", e.target.value)}
                      placeholder="Коротко опишіть ситуацію…"
                    />
                  </Field>
                )}
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  Назад
                </button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Далі
                </button>
              </div>
            </>
          )}

          {step === "photos" && (
            <>
              <div className="kicker">Документи</div>
              <h2 className="title">Фото у правильній послідовності</h2>
              <p className="lead">
                Додайте фото по порядку: спершу головна сторінка паспорта, далі
                штампи / інші сторінки. Порядок можна змінити стрілками ↑ ↓.
              </p>
              <label className="drop">
                <strong>Натисніть, щоб додати фото</strong>
                <span className="drop-sub">JPG / PNG / WEBP · до 12 файлів</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    onPickPhotos(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              {errors.photos ? <div className="err">{errors.photos}</div> : null}
              <div className="photo-list" style={{ marginTop: "1rem" }}>
                {photos.map((p, i) => (
                  <div className="photo-row" key={p.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" />
                    <div className="photo-meta">
                      <strong>
                        #{i + 1} · {p.file.name}
                      </strong>
                      <span>{Math.round(p.file.size / 1024)} KB</span>
                    </div>
                    <button type="button" className="icon-btn" onClick={() => movePhoto(i, -1)} title="Вище">
                      ↑
                    </button>
                    <button type="button" className="icon-btn" onClick={() => movePhoto(i, 1)} title="Нижче">
                      ↓
                    </button>
                    <button type="button" className="icon-btn" onClick={() => removePhoto(p.id)} title="Видалити">
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  Назад
                </button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Перевірити
                </button>
              </div>
            </>
          )}

          {step === "review" && (
            <>
              <div className="kicker">Перевірка</div>
              <h2 className="title">Усе вірно?</h2>
              <p className="lead">Після надсилання менеджер перевірить анкету в CRM.</p>
              {submitError ? <div className="banner banner-error">{submitError}</div> : null}
              <div className="review">
                {[
                  ["ПІБ", data.full_name_latin],
                  ["Телефон", data.phone || "—"],
                  ["Email", data.email || "—"],
                  ["Дата народження", data.date_of_birth || "—"],
                  ["Документ", `${data.document_type || "—"} ${data.document_number || ""}`.trim()],
                  ["Штамп UA–HU", data.has_direct_border_stamp === "yes" ? "Так" : data.has_direct_border_stamp === "no" ? "Ні" : "—"],
                  ["Фото", `${photos.length} шт.`],
                ].map(([k, v]) => (
                  <div className="review-row" key={k}>
                    <span>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={prevStep} disabled={submitting}>
                  Назад
                </button>
                <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting}>
                  {submitting ? "Надсилаємо…" : "Надіслати анкету"}
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <>
              <div className="banner banner-ok">Анкету успішно надіслано</div>
              <h1 className="title">Дякуємо</h1>
              <p className="lead">
                Менеджер перевірить дані, за потреби уточнить деталі та додасть
                дату подачі й оплату в системі. Це вікно можна закрити.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
