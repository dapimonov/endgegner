import type { IQuestion } from "./data/questions";

export const ADJECTIVE_SESSION_LENGTH = 10;
export const ADJECTIVE_TRAINER_ID = "adjective-endings";
export const ADJECTIVE_ENDINGS: IQuestion["ending"][] = [
  "e",
  "en",
  "er",
  "es",
  "em",
];
export const ADJECTIVE_CASES: IQuestion["caseKey"][] = [
  "nom",
  "acc",
  "dat",
  "gen",
];
export const ADJECTIVE_GENDERS: IQuestion["gender"][] = [
  "m",
  "f",
  "n",
  "pl",
];
export const ADJECTIVE_ARTICLES: IQuestion["article"][] = [
  "definite",
  "ein",
  "quantity",
  "zero",
];
export const ADJECTIVE_ARTICLE_MARKS: Record<
  IQuestion["article"],
  string
> = {
  definite: "DER",
  ein: "EIN",
  quantity: "VIEL",
  zero: "Ø",
};

export function adjectiveSkillKey(question: IQuestion) {
  return `${question.caseKey}-${question.gender}-${question.article}`;
}
