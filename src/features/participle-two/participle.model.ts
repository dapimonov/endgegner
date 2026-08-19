export const PARTICIPLE_SESSION_LENGTH = 10;
export const PARTICIPLE_COHORT_SIZE = 50;
export const PARTICIPLE_VARIANTS_PER_VERB = 3;
export const PARTICIPLE_TRAINER_ID = "participle-two";
export const PARTICIPLE_STATS_KEY = "endgegner-participle-stats-v1";

export enum EParticipleFormation {
  Weak = "weak",
  Strong = "strong",
  Mixed = "mixed",
}

export enum EParticiplePattern {
  Simple = "simple",
  Separable = "separable",
  Inseparable = "inseparable",
  Ieren = "ieren",
}

export enum EPerfectAuxiliary {
  Haben = "haben",
  Sein = "sein",
}

export interface IParticipleVerb {
  id: string;
  rank: number;
  infinitive: string;
  participle: string;
  auxiliary: EPerfectAuxiliary;
  formation: EParticipleFormation;
  pattern: EParticiplePattern;
  middle: string;
  reflexive: boolean;
  subject?: string;
}

export interface IParticipleQuestion {
  id: string;
  verbId: string;
  before: string;
  after: string;
  answer: string;
  infinitive: string;
  tense: "Perfekt" | "Plusquamperfekt" | "Futur II";
  isQuestion: boolean;
}

export interface IParticipleRunItem {
  question: IParticipleQuestion;
  isPrimary: boolean;
}
