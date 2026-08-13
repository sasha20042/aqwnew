/** Реквізити контролера даних для GDPR-повідомлення (ст. 13 GDPR). Без публічного бренду. */
export const dataController = {
  /** Якщо не задано — у політиці використовуємо нейтральне формулювання. */
  name: (process.env.NEXT_PUBLIC_DATA_CONTROLLER_NAME || "").trim(),
  email: (process.env.NEXT_PUBLIC_DATA_CONTROLLER_EMAIL || "").trim(),
  address: (process.env.NEXT_PUBLIC_DATA_CONTROLLER_ADDRESS || "").trim(),
} as const;

export const privacyPolicyUpdatedAt = "14 серпня 2026";
