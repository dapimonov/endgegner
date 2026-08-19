export enum ELanguage {
  Russian = "ru",
  English = "en",
}

export enum EAppView {
  Arena = "arena",
  AdjectiveEndings = "adjective-endings",
  VerbPatterns = "verb-patterns",
}

export enum EAdjectiveAnswerMode {
  Word = "word",
  Ending = "ending",
}

export enum EVerbAnswerMode {
  Type = "type",
  Choice = "choice",
}

export enum EAnswerResult {
  Correct = "correct",
  Wrong = "wrong",
}

export interface IStatItem {
  correct: number;
  total: number;
}

export interface IAdjectiveStats {
  [key: string]: IStatItem;
}

export interface IVerbPatternStat extends IStatItem {
  prepositionErrors: number;
  reflexiveErrors: number;
}

export interface IVerbStats {
  [key: string]: IVerbPatternStat;
}
