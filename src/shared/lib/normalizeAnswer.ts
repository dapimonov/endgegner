export function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de-DE")
    .replaceAll("ß", "ss")
    .replace(/\s+/g, " ")
    .replace(/[.!?,;:]$/g, "");
}
