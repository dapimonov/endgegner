import type { IParticipleStats } from "../../shared/model";
import {
  PARTICIPLE_COHORT_SIZE,
  PARTICIPLE_SESSION_LENGTH,
  PARTICIPLE_VARIANTS_PER_VERB,
  type IParticipleQuestion,
  type IParticipleRunItem,
  type IParticipleVerb,
} from "./participle.model";

const STORAGE_KEY = "endgegner-participle-round-v1";

export interface IParticipleRoundState {
  cycle: number;
  cohortIndex: number;
  completedPrimaryIds: string[];
  activeRun: IParticipleStoredRunItem[];
  cursor: number;
  runNumber: number;
  recentVerbIds: string[];
}

export interface IParticipleStoredRunItem {
  questionId: string;
  isPrimary: boolean;
}

export interface IPrepareParticipleRunOptions {
  verbs: IParticipleVerb[];
  questions: IParticipleQuestion[];
  stats: IParticipleStats;
  state?: IParticipleRoundState | null;
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function emptyState(): IParticipleRoundState {
  return {
    cycle: 1,
    cohortIndex: 0,
    completedPrimaryIds: [],
    activeRun: [],
    cursor: 0,
    runNumber: 0,
    recentVerbIds: [],
  };
}

function questionVariant(question: IParticipleQuestion) {
  return Number(question.id.split("-").at(-1) ?? 1);
}

function activeItems(
  state: IParticipleRoundState,
  byQuestionId: Map<string, IParticipleQuestion>,
) {
  return state.activeRun
    .map((item) => {
      const question = byQuestionId.get(item.questionId);
      return question ? { question, isPrimary: item.isPrimary } : null;
    })
    .filter((item): item is IParticipleRunItem => Boolean(item));
}

function previousCohort(
  state: IParticipleRoundState,
  verbs: IParticipleVerb[],
) {
  if (state.cycle === 1 && state.cohortIndex === 0) return [];
  const cohortCount = Math.ceil(verbs.length / PARTICIPLE_COHORT_SIZE);
  const previousIndex =
    (state.cohortIndex - 1 + cohortCount) % cohortCount;
  return verbs.slice(
    previousIndex * PARTICIPLE_COHORT_SIZE,
    (previousIndex + 1) * PARTICIPLE_COHORT_SIZE,
  );
}

function selectCarryovers(
  state: IParticipleRoundState,
  verbs: IParticipleVerb[],
  questionsByVerb: Map<string, IParticipleQuestion[]>,
  stats: IParticipleStats,
) {
  const previous = previousCohort(state, verbs);
  if (!previous.length) return [];

  const weak = previous
    .filter((verb) => {
      const item = stats[verb.id];
      return item?.total &&
        (item.correct < item.total ||
          item.recent.length < 3 ||
          item.recent.some((answer) => !answer));
    })
    .sort((first, second) => {
      const firstStat = stats[first.id];
      const secondStat = stats[second.id];
      const firstAccuracy = firstStat.correct / firstStat.total;
      const secondAccuracy = secondStat.correct / secondStat.total;
      return firstAccuracy - secondAccuracy || secondStat.total - firstStat.total;
    });

  let amount = state.runNumber % 2 === 1 ? 2 : 0;
  let candidates = weak;
  if (!candidates.length && state.runNumber % 3 === 2) {
    amount = 1;
    candidates = shuffle(previous.filter((verb) => stats[verb.id]?.total));
  }
  if (!amount || !candidates.length) return [];

  return candidates.slice(0, amount).flatMap((verb, index) => {
    const variants = questionsByVerb.get(verb.id) ?? [];
    const question = variants[(state.runNumber + index) % variants.length];
    return question ? [{ question, isPrimary: false }] : [];
  });
}

function selectPrimary(
  state: IParticipleRoundState,
  cohortVerbIds: Set<string>,
  questions: IParticipleQuestion[],
  amount: number,
  blockedVerbIds: Set<string>,
) {
  const completed = new Set(state.completedPrimaryIds);
  const selected: IParticipleRunItem[] = [];
  const usedVerbIds = new Set(blockedVerbIds);
  const recentVerbIds = new Set(state.recentVerbIds);
  const remaining = questions.filter(
    (question) =>
      cohortVerbIds.has(question.verbId) && !completed.has(question.id),
  );

  while (selected.length < amount) {
    const available = remaining.filter(
      (question) =>
        !selected.some((item) => item.question.id === question.id) &&
        !usedVerbIds.has(question.verbId),
    );
    if (!available.length) break;
    const earliestVariant = Math.min(...available.map(questionVariant));
    const wave = shuffle(
      available.filter((question) => questionVariant(question) === earliestVariant),
    );
    const preferred = [
      ...wave.filter((question) => !recentVerbIds.has(question.verbId)),
      ...wave.filter((question) => recentVerbIds.has(question.verbId)),
    ];
    const question = preferred[0];
    if (!question) break;
    selected.push({ question, isPrimary: true });
    usedVerbIds.add(question.verbId);
  }

  return selected;
}

function selectFillers(
  state: IParticipleRoundState,
  verbs: IParticipleVerb[],
  questionsByVerb: Map<string, IParticipleQuestion[]>,
  usedVerbIds: Set<string>,
  amount: number,
) {
  const previous = previousCohort(state, verbs);
  const current = verbs.slice(
    state.cohortIndex * PARTICIPLE_COHORT_SIZE,
    (state.cohortIndex + 1) * PARTICIPLE_COHORT_SIZE,
  );
  const candidates = shuffle([...previous, ...current]).filter(
    (verb) => !usedVerbIds.has(verb.id),
  );

  return candidates.slice(0, amount).flatMap((verb, index) => {
    const variants = questionsByVerb.get(verb.id) ?? [];
    const question = variants[(state.runNumber + index) % variants.length];
    return question ? [{ question, isPrimary: false }] : [];
  });
}

export function prepareParticipleRun({
  verbs,
  questions,
  stats,
  state,
}: IPrepareParticipleRunOptions) {
  const current = state ?? emptyState();
  const byQuestionId = new Map(
    questions.map((question) => [question.id, question]),
  );
  const restoredItems = activeItems(current, byQuestionId);
  if (restoredItems.length) {
    return {
      items: restoredItems,
      state: {
        ...current,
        activeRun: restoredItems.map((item) => ({
          questionId: item.question.id,
          isPrimary: item.isPrimary,
        })),
        cursor: Math.min(current.cursor, restoredItems.length - 1),
      },
    };
  }

  const questionsByVerb = new Map<string, IParticipleQuestion[]>();
  for (const question of questions) {
    const currentQuestions = questionsByVerb.get(question.verbId) ?? [];
    currentQuestions.push(question);
    questionsByVerb.set(question.verbId, currentQuestions);
  }
  const cohort = verbs.slice(
    current.cohortIndex * PARTICIPLE_COHORT_SIZE,
    (current.cohortIndex + 1) * PARTICIPLE_COHORT_SIZE,
  );
  const cohortVerbIds = new Set(cohort.map((verb) => verb.id));
  const carryovers = selectCarryovers(
    current,
    verbs,
    questionsByVerb,
    stats,
  );
  const blockedVerbIds = new Set(
    carryovers.map((item) => item.question.verbId),
  );
  const primary = selectPrimary(
    current,
    cohortVerbIds,
    questions,
    PARTICIPLE_SESSION_LENGTH - carryovers.length,
    blockedVerbIds,
  );
  const selected = [...primary, ...carryovers];
  const usedVerbIds = new Set(selected.map((item) => item.question.verbId));
  const fillers = selectFillers(
    current,
    verbs,
    questionsByVerb,
    usedVerbIds,
    PARTICIPLE_SESSION_LENGTH - selected.length,
  );
  const items = shuffle([...selected, ...fillers]);
  const nextState: IParticipleRoundState = {
    ...current,
    activeRun: items.map((item) => ({
      questionId: item.question.id,
      isPrimary: item.isPrimary,
    })),
    cursor: 0,
  };

  return { items, state: nextState };
}

export function advanceParticipleRun(state: IParticipleRoundState) {
  return {
    ...state,
    cursor: Math.min(state.cursor + 1, state.activeRun.length - 1),
  };
}

export function completeParticipleRun(
  state: IParticipleRoundState,
  totalVerbs: number,
) {
  const completed = new Set(state.completedPrimaryIds);
  for (const item of state.activeRun) {
    if (item.isPrimary) completed.add(item.questionId);
  }
  const completedIds = [...completed];
  const cohortTarget = PARTICIPLE_COHORT_SIZE * PARTICIPLE_VARIANTS_PER_VERB;
  const recentVerbIds = state.activeRun.map((item) =>
    item.questionId.replace(/-\d+$/, ""),
  );

  if (completedIds.length >= cohortTarget) {
    const cohortCount = Math.ceil(totalVerbs / PARTICIPLE_COHORT_SIZE);
    const nextCohort = (state.cohortIndex + 1) % cohortCount;
    return {
      cycle: nextCohort === 0 ? state.cycle + 1 : state.cycle,
      cohortIndex: nextCohort,
      completedPrimaryIds: [],
      activeRun: [],
      cursor: 0,
      runNumber: 0,
      recentVerbIds,
    };
  }

  return {
    ...state,
    completedPrimaryIds: completedIds,
    activeRun: [],
    cursor: 0,
    runNumber: state.runNumber + 1,
    recentVerbIds,
  };
}

export function loadParticipleRoundState() {
  if (typeof window === "undefined") return null;
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    ) as IParticipleRoundState | null;
    if (!saved || !Array.isArray(saved.completedPrimaryIds)) return null;
    return saved;
  } catch {
    return null;
  }
}

export function saveParticipleRoundState(state: IParticipleRoundState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
