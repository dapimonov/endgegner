import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { useStatsDrawer } from "../../shared/hooks/useStatsDrawer";
import {
  loadMistakeReviewState,
  prepareMistakeReviewRun,
  recordMistakeReviewAnswer,
  registerMistake,
  saveMistakeReviewState,
  type IMistakeReviewRunItem,
  type IMistakeReviewState,
} from "../../shared/lib/mistakeReview";
import { normalizeAnswer } from "../../shared/lib/normalizeAnswer";
import {
  EAnswerResult,
  EMistakeReviewStep,
  ETrainerRunKind,
  type IParticipleStats,
} from "../../shared/model";
import {
  PARTICIPLE_QUESTIONS,
  PARTICIPLE_VERBS,
  PARTICIPLE_VERBS_BY_ID,
} from "./data/participleVerbs";
import {
  advanceParticipleRun,
  completeParticipleRun,
  loadParticipleRoundState,
  prepareParticipleRun,
  saveParticipleRoundState,
  type IParticipleRoundState,
} from "./participleRound";
import {
  EParticipleFormation,
  EParticiplePattern,
  PARTICIPLE_STATS_KEY,
  PARTICIPLE_TRAINER_ID,
  type IParticipleQuestion,
  type IParticipleRunItem,
} from "./participle.model";

const REVIEW_MISTAKES_PER_RUN = 5;

export interface IUseParticipleTrainerOptions {
  onCorrect: () => void;
}

export interface IParticipleStatsOverview {
  correct: number;
  total: number;
  practiced: number;
  mastered: number;
  needsWork: number;
}

export interface IParticipleGroupStats {
  key: string;
  correct: number;
  total: number;
  verbs: number;
}

function emptyStats(): IParticipleStats {
  return {};
}

function isMastered(recent: boolean[]) {
  return recent.length >= 3 && recent.slice(-3).every(Boolean);
}

export function useParticipleTrainer({
  onCorrect,
}: IUseParticipleTrainerOptions) {
  const [runItems, setRunItems] = useState<IParticipleRunItem[]>([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<EAnswerResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<IParticipleStats>({});
  const [roundState, setRoundState] =
    useState<IParticipleRoundState | null>(null);
  const [restored, setRestored] = useState(false);
  const [runKind, setRunKind] = useState(ETrainerRunKind.Regular);
  const [reviewState, setReviewState] = useState<
    IMistakeReviewState<string>
  >({ active: [], masteredIds: [] });
  const [reviewItems, setReviewItems] = useState<
    IMistakeReviewRunItem<IParticipleQuestion, string>[]
  >([]);
  const [masteredAtRunStart, setMasteredAtRunStart] = useState(0);
  const statsDrawer = useStatsDrawer();
  const reviewDrawer = useStatsDrawer();

  const questions = runItems.map((item) => item.question);
  const question = questions[index];
  const currentRunItem = runItems[index];
  const reviewItem =
    runKind === ETrainerRunKind.Mistakes ? reviewItems[index] : null;

  useEffect(() => {
    const restore = window.setTimeout(() => {
      let savedStats = emptyStats();
      try {
        const parsed = JSON.parse(
          localStorage.getItem(PARTICIPLE_STATS_KEY) ?? "{}",
        ) as IParticipleStats;
        savedStats = Object.fromEntries(
          Object.entries(parsed).map(([verbId, item]) => [
            verbId,
            {
              correct: Number(item?.correct) || 0,
              total: Number(item?.total) || 0,
              recent: Array.isArray(item?.recent)
                ? item.recent.slice(-3).map(Boolean)
                : [],
            },
          ]),
        );
      } catch {
        savedStats = emptyStats();
      }

      const savedRound = loadParticipleRoundState();
      const savedReview = loadMistakeReviewState<string>(
        PARTICIPLE_TRAINER_ID,
      );
      const activeRun = prepareParticipleRun({
        verbs: PARTICIPLE_VERBS,
        questions: PARTICIPLE_QUESTIONS,
        stats: savedStats,
        state: savedRound,
      });

      setStats(savedStats);
      setRunItems(activeRun.items);
      setIndex(activeRun.state.cursor);
      setRoundState(activeRun.state);
      setReviewState(savedReview);
      saveParticipleRoundState(activeRun.state);
      setRestored(true);
    }, 0);

    return () => window.clearTimeout(restore);
  }, []);

  const statsOverview = useMemo<IParticipleStatsOverview>(() => {
    let correct = 0;
    let total = 0;
    let practiced = 0;
    let mastered = 0;
    for (const verb of PARTICIPLE_VERBS) {
      const item = stats[verb.id];
      if (!item?.total) continue;
      correct += item.correct;
      total += item.total;
      practiced += 1;
      if (isMastered(item.recent)) mastered += 1;
    }
    return {
      correct,
      total,
      practiced,
      mastered,
      needsWork: practiced - mastered,
    };
  }, [stats]);

  const groupStats = useMemo<IParticipleGroupStats[]>(() => {
    const definitions = [
      {
        key: "weak",
        matches: (verbId: string) =>
          PARTICIPLE_VERBS_BY_ID.get(verbId)?.formation ===
          EParticipleFormation.Weak,
      },
      {
        key: "strong",
        matches: (verbId: string) =>
          PARTICIPLE_VERBS_BY_ID.get(verbId)?.formation ===
          EParticipleFormation.Strong,
      },
      {
        key: "mixed",
        matches: (verbId: string) =>
          PARTICIPLE_VERBS_BY_ID.get(verbId)?.formation ===
          EParticipleFormation.Mixed,
      },
      {
        key: "separable",
        matches: (verbId: string) =>
          PARTICIPLE_VERBS_BY_ID.get(verbId)?.pattern ===
          EParticiplePattern.Separable,
      },
      {
        key: "inseparable",
        matches: (verbId: string) =>
          PARTICIPLE_VERBS_BY_ID.get(verbId)?.pattern ===
          EParticiplePattern.Inseparable,
      },
      {
        key: "ieren",
        matches: (verbId: string) =>
          PARTICIPLE_VERBS_BY_ID.get(verbId)?.pattern ===
          EParticiplePattern.Ieren,
      },
    ];

    return definitions.map((definition) => {
      const verbs = PARTICIPLE_VERBS.filter((verb) =>
        definition.matches(verb.id),
      );
      return verbs.reduce<IParticipleGroupStats>(
        (group, verb) => {
          const item = stats[verb.id];
          group.correct += item?.correct ?? 0;
          group.total += item?.total ?? 0;
          return group;
        },
        { key: definition.key, correct: 0, total: 0, verbs: verbs.length },
      );
    });
  }, [stats]);

  const orderedVerbs = useMemo(() => {
    return [...PARTICIPLE_VERBS].sort((first, second) => {
      const firstStats = stats[first.id];
      const secondStats = stats[second.id];
      const firstPracticed = Boolean(firstStats?.total);
      const secondPracticed = Boolean(secondStats?.total);
      if (firstPracticed !== secondPracticed) return firstPracticed ? -1 : 1;
      if (firstPracticed && secondPracticed) {
        const firstMastered = isMastered(firstStats.recent);
        const secondMastered = isMastered(secondStats.recent);
        if (firstMastered !== secondMastered) return firstMastered ? 1 : -1;
        const accuracyDifference =
          firstStats.correct / firstStats.total -
          secondStats.correct / secondStats.total;
        if (accuracyDifference !== 0) return accuracyDifference;
      }
      return first.infinitive.localeCompare(second.infinitive, "de");
    });
  }, [stats]);

  const weakSpot = useMemo(() => {
    const practiced = PARTICIPLE_VERBS.filter(
      (verb) => stats[verb.id]?.total,
    );
    if (!practiced.length) return null;
    return [...practiced].sort((first, second) => {
      const firstStats = stats[first.id];
      const secondStats = stats[second.id];
      return (
        firstStats.correct / firstStats.total -
        secondStats.correct / secondStats.total
      );
    })[0]?.infinitive ?? null;
  }, [stats]);

  const roundProgress = useMemo(() => {
    const primaryInRun = roundState?.activeRun.filter(
      (item) => item.isPrimary,
    ).length ?? 0;
    return Math.min(
      150,
      (roundState?.completedPrimaryIds.length ?? 0) + primaryInRun,
    );
  }, [roundState]);

  const fullSentence = question
    ? `${question.before}${question.answer}${question.after}`
    : "";

  function resetAnswer() {
    setValue("");
    setResult(null);
  }

  function updateRound(nextState: IParticipleRoundState) {
    setRoundState(nextState);
    saveParticipleRoundState(nextState);
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!question || result || !value.trim()) return;
    const isCorrect =
      normalizeAnswer(value) === normalizeAnswer(question.answer);
    const nextStreak = isCorrect ? streak + 1 : 0;

    setResult(isCorrect ? EAnswerResult.Correct : EAnswerResult.Wrong);
    setStreak(nextStreak);
    setBestStreak((current) => Math.max(current, nextStreak));
    if (isCorrect) {
      setCorrectCount((current) => current + 1);
    }

    if (runKind === ETrainerRunKind.Regular) {
      if (isCorrect) onCorrect();
      if (currentRunItem?.isPrimary) {
        const currentStats = stats[question.verbId] ?? {
          correct: 0,
          total: 0,
          recent: [],
        };
        const nextStats: IParticipleStats = {
          ...stats,
          [question.verbId]: {
            correct: currentStats.correct + (isCorrect ? 1 : 0),
            total: currentStats.total + 1,
            recent: [...currentStats.recent, isCorrect].slice(-3),
          },
        };
        setStats(nextStats);
        localStorage.setItem(
          PARTICIPLE_STATS_KEY,
          JSON.stringify(nextStats),
        );
      }

      if (!isCorrect) {
        const questionById = new Map(
          PARTICIPLE_QUESTIONS.map((item) => [item.id, item]),
        );
        const cleanedState: IMistakeReviewState<string> = {
          active: reviewState.active.filter(
            (item) => item.skillKey !== question.verbId,
          ),
          masteredIds: reviewState.masteredIds.filter(
            (id) => questionById.get(id)?.verbId !== question.verbId,
          ),
        };
        const nextReviewState = registerMistake(
          cleanedState,
          question.id,
          question.verbId,
        );
        setReviewState(nextReviewState);
        saveMistakeReviewState(PARTICIPLE_TRAINER_ID, nextReviewState);
      }
      return;
    }

    if (reviewItem) {
      const nextReviewState = recordMistakeReviewAnswer(
        reviewState,
        reviewItem.sourceQuestionId,
        reviewItem.step,
        isCorrect,
      );
      setReviewState(nextReviewState);
      saveMistakeReviewState(PARTICIPLE_TRAINER_ID, nextReviewState);

      if (!isCorrect && reviewItem.step === EMistakeReviewStep.Source) {
        setReviewItems((current) =>
          current.filter(
            (item, itemIndex) =>
              itemIndex <= index ||
              item.sourceQuestionId !== reviewItem.sourceQuestionId ||
              item.step !== EMistakeReviewStep.Analogue,
          ),
        );
        setRunItems((current) =>
          current.filter(
            (_item, itemIndex) =>
              itemIndex <= index ||
              reviewItems[itemIndex]?.sourceQuestionId !==
                reviewItem.sourceQuestionId ||
              reviewItems[itemIndex]?.step !==
                EMistakeReviewStep.Analogue,
          ),
        );
      }
    }
  }

  function goNext() {
    if (index === runItems.length - 1) {
      if (runKind === ETrainerRunKind.Regular && roundState) {
        updateRound(
          completeParticipleRun(roundState, PARTICIPLE_VERBS.length),
        );
      }
      setFinished(true);
      return;
    }
    if (runKind === ETrainerRunKind.Regular && roundState) {
      updateRound(advanceParticipleRun(roundState));
    }
    setIndex((current) => current + 1);
    resetAnswer();
  }

  function startRegularRun() {
    const nextRun = prepareParticipleRun({
      verbs: PARTICIPLE_VERBS,
      questions: PARTICIPLE_QUESTIONS,
      stats,
      state: roundState ?? loadParticipleRoundState(),
    });
    setRunItems(nextRun.items);
    setReviewItems([]);
    setRunKind(ETrainerRunKind.Regular);
    setIndex(nextRun.state.cursor);
    updateRound(nextRun.state);
    resetAnswer();
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
  }

  function startReview() {
    if (!reviewState.active.length) {
      startRegularRun();
      reviewDrawer.close();
      return;
    }

    if (
      runKind === ETrainerRunKind.Regular &&
      !finished &&
      result &&
      roundState
    ) {
      updateRound(
        index === runItems.length - 1
          ? completeParticipleRun(roundState, PARTICIPLE_VERBS.length)
          : advanceParticipleRun(roundState),
      );
    }

    const nextReviewItems = prepareMistakeReviewRun({
      items: PARTICIPLE_QUESTIONS,
      state: reviewState,
      maxMistakes: REVIEW_MISTAKES_PER_RUN,
      getId: (item) => item.id,
      getSkillKey: (item) => item.verbId,
    });
    if (!nextReviewItems.length) return;

    setRunKind(ETrainerRunKind.Mistakes);
    setReviewItems(nextReviewItems);
    setRunItems(
      nextReviewItems.map((item) => ({
        question: item.question,
        isPrimary: false,
      })),
    );
    setMasteredAtRunStart(reviewState.masteredIds.length);
    setIndex(0);
    resetAnswer();
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
    statsDrawer.close();
    reviewDrawer.close();
  }

  function startAgain() {
    if (
      runKind === ETrainerRunKind.Mistakes &&
      reviewState.active.length
    ) {
      startReview();
      return;
    }
    startRegularRun();
  }

  function openStats() {
    reviewDrawer.close();
    statsDrawer.open();
  }

  function openReview() {
    statsDrawer.close();
    reviewDrawer.open();
  }

  return {
    restored,
    questions,
    question,
    currentRunItem,
    index,
    value,
    setValue,
    result,
    correctCount,
    streak,
    bestStreak,
    finished,
    runKind,
    reviewItem,
    reviewState,
    reviewDrawer,
    masteredThisRun: Math.max(
      0,
      reviewState.masteredIds.length - masteredAtRunStart,
    ),
    stats,
    statsOverview,
    groupStats,
    orderedVerbs,
    weakSpot,
    roundState,
    roundProgress,
    statsDrawer,
    openStats,
    openReview,
    fullSentence,
    submit,
    goNext,
    startAgain,
    startRegularRun,
    startReview,
  };
}
