/** Реквізити контролера даних для GDPR-повідомлення (ст. 13 GDPR). */
export const dataController = {
  name: process.env.NEXT_PUBLIC_DATA_CONTROLLER_NAME || "AQW Legal",
  email:
    process.env.NEXT_PUBLIC_DATA_CONTROLLER_EMAIL ||
    "privacy@alexxqualitywork.com",
  /** Заповніть реальну юридичну адресу в env за потреби */
  address: process.env.NEXT_PUBLIC_DATA_CONTROLLER_ADDRESS || "",
  website:
    process.env.NEXT_PUBLIC_FORM_PUBLIC_URL ||
    "https://alexxqualityworkcrm.com",
} as const;

export const privacyPolicyUpdatedAt = "14 серпня 2026";
