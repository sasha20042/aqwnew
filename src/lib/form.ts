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
  current_address: string;
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
  current_address: "",
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
