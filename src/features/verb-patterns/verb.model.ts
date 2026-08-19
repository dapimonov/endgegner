export const VERB_SESSION_LENGTH = 10;
export const VERB_TRAINER_ID = "verb-government";
export const VERB_STATS_KEY = "endgegner-verb-stats";
export const VERB_MODE_KEY = "endgegner-verb-mode";

export function bareVerb(value: string) {
  return value.replace(/^sich\s+/, "");
}
