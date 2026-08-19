import { EMistakeReviewStep } from "../model";

const STORAGE_KEY = "endgegner-mistake-review-v1";

export interface IMistakeRecord<Id extends string | number> {
  sourceQuestionId: Id;
  skillKey: string;
  step: EMistakeReviewStep;
  wrongCount: number;
  lastWrongAt: number;
}

export interface IMistakeReviewState<Id extends string | number> {
  active: IMistakeRecord<Id>[];
  masteredIds: Id[];
}

export interface IMistakeReviewRunItem<T, Id extends string | number> {
  question: T;
  sourceQuestionId: Id;
  step: EMistakeReviewStep;
}

export interface IPrepareMistakeReviewRunOptions<
  T,
  Id extends string | number,
> {
  items: T[];
  state: IMistakeReviewState<Id>;
  maxMistakes: number;
  getId: (item: T) => Id;
  getSkillKey: (item: T) => string;
}

function emptyState<Id extends string | number>(): IMistakeReviewState<Id> {
  return { active: [], masteredIds: [] };
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function loadMistakeReviewState<Id extends string | number>(
  trainerId: string,
) {
  if (typeof window === "undefined") return emptyState<Id>();
  try {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
      string,
      IMistakeReviewState<Id>
    >;
    const saved = store[trainerId];
    return {
      active: Array.isArray(saved?.active) ? saved.active : [],
      masteredIds: Array.isArray(saved?.masteredIds)
        ? saved.masteredIds
        : [],
    };
  } catch {
    return emptyState<Id>();
  }
}

export function saveMistakeReviewState<Id extends string | number>(
  trainerId: string,
  state: IMistakeReviewState<Id>,
) {
  if (typeof window === "undefined") return;
  let store: Record<string, IMistakeReviewState<Id>> = {};
  try {
    store = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
      string,
      IMistakeReviewState<Id>
    >;
  } catch {
    store = {};
  }
  store[trainerId] = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function registerMistake<Id extends string | number>(
  state: IMistakeReviewState<Id>,
  sourceQuestionId: Id,
  skillKey: string,
) {
  const existing = state.active.find(
    (item) => item.sourceQuestionId === sourceQuestionId,
  );
  const record: IMistakeRecord<Id> = {
    sourceQuestionId,
    skillKey,
    step: EMistakeReviewStep.Source,
    wrongCount: (existing?.wrongCount ?? 0) + 1,
    lastWrongAt: Date.now(),
  };

  return {
    active: [
      ...state.active.filter(
        (item) => item.sourceQuestionId !== sourceQuestionId,
      ),
      record,
    ],
    masteredIds: state.masteredIds.filter((id) => id !== sourceQuestionId),
  };
}

export function recordMistakeReviewAnswer<Id extends string | number>(
  state: IMistakeReviewState<Id>,
  sourceQuestionId: Id,
  step: EMistakeReviewStep,
  isCorrect: boolean,
) {
  const record = state.active.find(
    (item) => item.sourceQuestionId === sourceQuestionId,
  );
  if (!record) return state;

  if (!isCorrect) {
    return {
      ...state,
      active: state.active.map((item) =>
        item.sourceQuestionId === sourceQuestionId
          ? {
              ...item,
              step: EMistakeReviewStep.Source,
              wrongCount: item.wrongCount + 1,
              lastWrongAt: Date.now(),
            }
          : item,
      ),
    };
  }

  if (step === EMistakeReviewStep.Source) {
    return {
      ...state,
      active: state.active.map((item) =>
        item.sourceQuestionId === sourceQuestionId
          ? { ...item, step: EMistakeReviewStep.Analogue }
          : item,
      ),
    };
  }

  return {
    active: state.active.filter(
      (item) => item.sourceQuestionId !== sourceQuestionId,
    ),
    masteredIds: state.masteredIds.includes(sourceQuestionId)
      ? state.masteredIds
      : [...state.masteredIds, sourceQuestionId],
  };
}

export function prepareMistakeReviewRun<T, Id extends string | number>({
  items,
  state,
  maxMistakes,
  getId,
  getSkillKey,
}: IPrepareMistakeReviewRunOptions<T, Id>) {
  const byId = new Map(items.map((item) => [getId(item), item]));
  const records = [...state.active]
    .filter((record) => byId.has(record.sourceQuestionId))
    .sort(
      (first, second) =>
        second.wrongCount - first.wrongCount ||
        first.lastWrongAt - second.lastWrongAt,
    )
    .slice(0, Math.max(0, maxMistakes));
  const sourceItems: IMistakeReviewRunItem<T, Id>[] = [];
  const analogueItems: IMistakeReviewRunItem<T, Id>[] = [];
  const usedAnalogueIds = new Set<Id>();

  for (const record of records) {
    const source = byId.get(record.sourceQuestionId);
    if (!source) continue;

    if (record.step === EMistakeReviewStep.Source) {
      sourceItems.push({
        question: source,
        sourceQuestionId: record.sourceQuestionId,
        step: EMistakeReviewStep.Source,
      });
    }

    const analogues = shuffle(
      items.filter(
        (item) =>
          getId(item) !== record.sourceQuestionId &&
          getSkillKey(item) === record.skillKey,
      ),
    );
    const analogue =
      analogues.find((item) => !usedAnalogueIds.has(getId(item))) ??
      analogues[0];
    if (!analogue) continue;

    usedAnalogueIds.add(getId(analogue));
    analogueItems.push({
      question: analogue,
      sourceQuestionId: record.sourceQuestionId,
      step: EMistakeReviewStep.Analogue,
    });
  }

  return [...sourceItems, ...shuffle(analogueItems)];
}
