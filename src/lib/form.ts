export type Sex = "" | "male" | "female";
export type YesNo = "" | "yes" | "no";
export type Marital =
  | ""
  | "single"
  | "married"
  | "divorced"
  | "widowed"
  | "partner";
export type RouteHu = "" | "car" | "train" | "bus" | "plane" | "other";
export type Crossing =
  | ""
  | "official_no_stamp"
  | "unofficial_forest_river"
  | "other";

export type FormDataState = {
  full_name_latin: string;
  phone: string;
  maiden_name_latin: string;
  mother_maiden_name_latin: string;
  date_of_birth: string;
  sex: Sex;
  marital_status: Marital;
  nationality: string;
  country_of_birth: string;
  place_of_birth: string;
  document_type: string;
  document_number: string;
  email: string;
  residence_country: string;
  has_foreign_passport: YesNo;
  has_direct_border_stamp: YesNo;
  left_via_other_country: YesNo;
  exit_ukraine_date: string;
  via_other_country_name: string;
  route_to_hungary: RouteHu;
  route_to_hungary_other: string;
  enter_hungary_date: string;
  official_ukraine_crossing: YesNo;
  unofficial_crossing_situation: Crossing;
  crossing_situation_explanation: string;
};

export const emptyForm = (): FormDataState => ({
  full_name_latin: "",
  phone: "",
  maiden_name_latin: "",
  mother_maiden_name_latin: "",
  date_of_birth: "",
  sex: "",
  marital_status: "",
  nationality: "Ukrainian",
  country_of_birth: "Ukraine",
  place_of_birth: "",
  document_type: "Passport",
  document_number: "",
  email: "",
  residence_country: "Угорщина",
  has_foreign_passport: "",
  has_direct_border_stamp: "",
  left_via_other_country: "",
  exit_ukraine_date: "",
  via_other_country_name: "",
  route_to_hungary: "",
  route_to_hungary_other: "",
  enter_hungary_date: "",
  official_ukraine_crossing: "",
  unofficial_crossing_situation: "",
  crossing_situation_explanation: "",
});

export const LATIN_RE = /^[A-Za-z]+(?:[ \-'][A-Za-z]+)*$/;

export function isLatin(value: string): boolean {
  const v = value.trim();
  return v === "" || LATIN_RE.test(v);
}

export function hasCyrillic(value: string): boolean {
  return /[\u0400-\u04FF]/.test(value);
}

const FIELD_LABELS: Record<string, string> = {
  token: "Посилання",
  photos: "Фото",
  "photos.0": "Фото",
  residence_country: "Країна перебування",
  "hungary_questionnaire.full_name_latin": "ПІБ",
  "hungary_questionnaire.phone": "Телефон",
  "hungary_questionnaire.email": "Email",
  "hungary_questionnaire.date_of_birth": "Дата народження",
  "hungary_questionnaire.sex": "Стать",
  "hungary_questionnaire.marital_status": "Сімейний стан",
  "hungary_questionnaire.nationality": "Громадянство",
  "hungary_questionnaire.country_of_birth": "Країна народження",
  "hungary_questionnaire.place_of_birth": "Місто народження",
  "hungary_questionnaire.document_type": "Тип документа",
  "hungary_questionnaire.document_number": "Номер документа",
  "hungary_questionnaire.maiden_name_latin": "Дівоче прізвище",
  "hungary_questionnaire.mother_maiden_name_latin": "Дівоче прізвище матері",
  "hungary_questionnaire.has_foreign_passport": "Закордонний паспорт",
  "hungary_questionnaire.has_direct_border_stamp": "Штамп UA–HU",
  "hungary_questionnaire.left_via_other_country": "Виїзд через іншу країну",
  "hungary_questionnaire.exit_ukraine_date": "Дата виїзду з України",
  "hungary_questionnaire.via_other_country_name": "Країна транзиту",
  "hungary_questionnaire.route_to_hungary": "Шлях до Угорщини",
  "hungary_questionnaire.route_to_hungary_other": "Інший шлях",
  "hungary_questionnaire.enter_hungary_date": "Дата вʼїзду в Угорщину",
  "hungary_questionnaire.official_ukraine_crossing": "Офіційний перетин",
  "hungary_questionnaire.unofficial_crossing_situation": "Ситуація перетину",
  "hungary_questionnaire.crossing_situation_explanation": "Пояснення перетину",
};

function labelForField(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  if (field.startsWith("photos.")) return "Фото";
  if (field.startsWith("hungary_questionnaire.")) {
    return field.replace("hungary_questionnaire.", "");
  }
  return field;
}

/** Збирає зрозуміле повідомлення з відповіді CRM / Next API. */
export function formatSubmitError(json: unknown, status?: number): string {
  const data = (json && typeof json === "object" ? json : {}) as {
    message?: string;
    ok?: boolean;
    errors?: Record<string, string[] | string>;
  };

  const lines: string[] = [];
  if (data.errors && typeof data.errors === "object") {
    for (const [field, msgs] of Object.entries(data.errors)) {
      const list = Array.isArray(msgs) ? msgs : [String(msgs)];
      for (const msg of list) {
        if (!msg) continue;
        lines.push(`${labelForField(field)}: ${msg}`);
      }
    }
  }

  if (lines.length > 0) {
    return lines.join("\n");
  }

  const msg = typeof data.message === "string" ? data.message.trim() : "";
  if (msg && !/^the given data was invalid\.?$/i.test(msg)) {
    return msg;
  }

  if (status === 401) return "Невірний ключ API форми. Зверніться до менеджера.";
  if (status === 410) return "Це посилання вже використано або прострочене.";
  if (status === 429) return "Забагато спроб. Зачекайте кілька хвилин і спробуйте знову.";
  if (status === 503) return "Сервер тимчасово недоступний. Спробуйте пізніше.";
  if (status && status >= 500) return "Помилка сервера CRM. Спробуйте пізніше або напишіть менеджеру.";

  return "Не вдалося надіслати анкету. Перевірте дані і спробуйте ще раз.";
}
