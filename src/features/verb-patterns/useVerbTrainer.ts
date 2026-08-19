import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  VERB_PATTERNS,
  VERB_QUESTIONS,
  type IVerbQuestion,
} from "./data/verbQuestions";
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
  advanceCyclicRun,
  completeCyclicRun,
  loadTrainerCycleState,
  prepareCyclicRun,
  saveTrainerCycleState,
  type ITrainerCycleState,
} from "../../shared/lib/trainerCycle";
import {
  EAnswerResult,
  EMistakeReviewStep,
  ETrainerRunKind,
  EVerbAnswerMode,
  type IVerbStats,
} from "../../shared/model";
import {
  VERB_MODE_KEY,
  VERB_SESSION_LENGTH,
  VERB_STATS_KEY,
  VERB_TRAINER_ID,
} from "./verb.model";

const REVIEW_MISTAKES_PER_RUN = 5;

export interface IUseVerbTrainerOptions {
  onCorrect: () => void;
}

export interface IVerbStatsOverview {
  correct: number;
  total: number;
  mistakes: number;
  practiced: number;
}

export function useVerbTrainer({ onCorrect }: IUseVerbTrainerOptions) {
  const [mode, setMode] = useState(EVerbAnswerMode.Type);
  const [questions, setQuestions] = useState<IVerbQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [selectedReflexive, setSelectedReflexive] = useState<string | null>(
    null,
  );
  const [selectedPreposition, setSelectedPreposition] = useState<string | null>(
    null,
  );
  const [result, setResult] = useState<EAnswerResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<IVerbStats>({});
  const [cycleState, setCycleState] = useState<
    ITrainerCycleState<number> | null
  >(null);
  const [restored, setRestored] = useState(false);
  const [runKind, setRunKind] = useState(ETrainerRunKind.Regular);
  const [reviewState, setReviewState] = useState<
    IMistakeReviewState<number>
  >({ active: [], masteredIds: [] });
  const [reviewItems, setReviewItems] = useState<
    IMistakeReviewRunItem<IVerbQuestion, number>[]
  >([]);
  const [masteredAtRunStart, setMasteredAtRunStart] = useState(0);
  const statsDrawer = useStatsDrawer();
  const reviewDrawer = useStatsDrawer();
  const question = questions[index];
  const reviewItem =
    runKind === ETrainerRunKind.Mistakes ? reviewItems[index] : null;

  useEffect(() => {
    const restore = window.setTimeout(() => {
      let savedStats: IVerbStats = {};
      let savedMode = EVerbAnswerMode.Type;
      try {
        savedStats = JSON.parse(
          localStorage.getItem(VERB_STATS_KEY) ?? "{}",
        );
        const storedMode = localStorage.getItem(VERB_MODE_KEY);
        if (
          storedMode === EVerbAnswerMode.Type ||
          storedMode === EVerbAnswerMode.Choice
        ) {
          savedMode = storedMode;
        }
      } catch {
        savedStats = {};
      }

      const savedCycle = loadTrainerCycleState<number>(VERB_TRAINER_ID);
      const savedReview = loadMistakeReviewState<number>(VERB_TRAINER_ID);
      const activeRun = prepareCyclicRun({
        items: VERB_QUESTIONS,
        runSize: VERB_SESSION_LENGTH,
        getId: (item) => item.id,
        state: savedCycle,
      });

      setStats(savedStats);
      setMode(savedMode);
      setQuestions(activeRun.items);
      setIndex(activeRun.state.cursor);
      setCycleState(activeRun.state);
      setReviewState(savedReview);
      saveTrainerCycleState(VERB_TRAINER_ID, activeRun.state);
      setRestored(true);
    }, 0);

    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(VERB_MODE_KEY, mode);
  }, [mode, restored]);

  const choiceAnswer = [
    question?.reflexiveAnswer ? selectedReflexive : null,
    selectedPreposition,
  ]
    .filter(Boolean)
    .join(" ");
  const submittedAnswer =
    mode === EVerbAnswerMode.Type ? value : choiceAnswer;
  const choiceComplete =
    Boolean(selectedPreposition) &&
    (!question?.reflexiveAnswer || Boolean(selectedReflexive));
  const fullSentence = question
    ? `${question.before}${question.answer}${question.after}`
    : "";

  const statsOverview = useMemo<IVerbStatsOverview>(() => {
    let correct = 0;
    let total = 0;
    let practiced = 0;
    for (const pattern of VERB_PATTERNS) {
      const item = stats[pattern.id];
      if (item?.total) practiced += 1;
      correct += item?.correct ?? 0;
      total += item?.total ?? 0;
    }
    return { correct, total, mistakes: total - correct, practiced };
  }, [stats]);

  const orderedPatterns = useMemo(() => {
    return [...VERB_PATTERNS].sort((first, second) => {
      const firstStats = stats[first.id];
      const secondStats = stats[second.id];
      const firstPracticed = Boolean(firstStats?.total);
      const secondPracticed = Boolean(secondStats?.total);
      if (firstPracticed !== secondPracticed) return firstPracticed ? -1 : 1;
      if (firstPracticed && secondPracticed) {
        const accuracyDifference =
          firstStats.correct / firstStats.total -
          secondStats.correct / secondStats.total;
        if (accuracyDifference !== 0) return accuracyDifference;
        return secondStats.total - firstStats.total;
      }
      return first.frame.localeCompare(second.frame, "de");
    });
  }, [stats]);

  const weakSpot = useMemo(() => {
    const entries = Object.entries(stats).filter(([, item]) => item.total > 0);
    if (!entries.length) return null;
    const [patternId] = entries.sort(
      ([, first], [, second]) =>
        first.correct / first.total - second.correct / second.total,
    )[0];
    return (
      VERB_PATTERNS.find((pattern) => pattern.id === patternId)?.frame ?? null
    );
  }, [stats]);

  function resetAnswer() {
    setValue("");
    setSelectedReflexive(null);
    setSelectedPreposition(null);
    setResult(null);
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!question || result) return;
    const candidate =
      mode === EVerbAnswerMode.Type ? value : choiceAnswer;
    if (!candidate.trim()) return;

    const normalizedCandidate = normalizeAnswer(candidate);
    const normalizedExpected = normalizeAnswer(question.answer);
    const tokens = normalizedCandidate.split(" ").filter(Boolean);
    const prepositionCorrect = tokens.at(-1) === question.preposition;
    const reflexiveCorrect = question.reflexiveAnswer
      ? tokens[0] === question.reflexiveAnswer
      : true;
    const isCorrect = normalizedCandidate === normalizedExpected;
    const nextStreak = isCorrect ? streak + 1 : 0;

    setResult(isCorrect ? EAnswerResult.Correct : EAnswerResult.Wrong);
    setStreak(nextStreak);
    setBestStreak((current) => Math.max(current, nextStreak));
    if (isCorrect) {
      setCorrectCount((current) => current + 1);
    }

    if (runKind === ETrainerRunKind.Regular) {
      const patternStats = stats[question.patternId] ?? {
        correct: 0,
        total: 0,
        prepositionErrors: 0,
        reflexiveErrors: 0,
      };
      const nextStats: IVerbStats = {
        ...stats,
        [question.patternId]: {
          correct: patternStats.correct + (isCorrect ? 1 : 0),
          total: patternStats.total + 1,
          prepositionErrors:
            patternStats.prepositionErrors + (!prepositionCorrect ? 1 : 0),
          reflexiveErrors:
            patternStats.reflexiveErrors + (!reflexiveCorrect ? 1 : 0),
        },
      };
      setStats(nextStats);
      localStorage.setItem(VERB_STATS_KEY, JSON.stringify(nextStats));

      if (isCorrect) {
        onCorrect();
      } else {
        const nextReviewState = registerMistake(
          reviewState,
          question.id,
          question.patternId,
        );
        setReviewState(nextReviewState);
        saveMistakeReviewState(VERB_TRAINER_ID, nextReviewState);
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
      saveMistakeReviewState(VERB_TRAINER_ID, nextReviewState);

      if (!isCorrect && reviewItem.step === EMistakeReviewStep.Source) {
        setReviewItems((current) =>
          current.filter(
            (item, itemIndex) =>
              itemIndex <= index ||
              item.sourceQuestionId !== reviewItem.sourceQuestionId ||
              item.step !== EMistakeReviewStep.Analogue,
          ),
        );
        setQuestions((current) =>
          current.filter(
            (_item, itemIndex) =>
              itemIndex <= index ||
              reviewItems[itemIndex]?.sourceQuestionId !==
                reviewItem.sourceQuestionId ||
              reviewItems[itemIndex]?.step !== EMistakeReviewStep.Analogue,
          ),
        );
      }
    }
  }

  function goNext() {
    if (index === questions.length - 1) {
      if (runKind === ETrainerRunKind.Regular && cycleState) {
        const completedCycle = completeCyclicRun(cycleState);
        setCycleState(completedCycle);
        saveTrainerCycleState(VERB_TRAINER_ID, completedCycle);
      }
      setFinished(true);
      return;
    }
    if (runKind === ETrainerRunKind.Regular && cycleState) {
      const advancedCycle = advanceCyclicRun(cycleState);
      setCycleState(advancedCycle);
      saveTrainerCycleState(VERB_TRAINER_ID, advancedCycle);
    }
    setIndex((current) => current + 1);
    resetAnswer();
  }

  function startRegularRun() {
    const nextRun = prepareCyclicRun({
      items: VERB_QUESTIONS,
      runSize: VERB_SESSION_LENGTH,
      getId: (item) => item.id,
      state:
        cycleState ?? loadTrainerCycleState<number>(VERB_TRAINER_ID),
    });
    setQuestions(nextRun.items);
    setReviewItems([]);
    setRunKind(ETrainerRunKind.Regular);
    setIndex(nextRun.state.cursor);
    setCycleState(nextRun.state);
    saveTrainerCycleState(VERB_TRAINER_ID, nextRun.state);
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
      cycleState
    ) {
      const nextCycle =
        index === questions.length - 1
          ? completeCyclicRun(cycleState)
          : advanceCyclicRun(cycleState);
      setCycleState(nextCycle);
      saveTrainerCycleState(VERB_TRAINER_ID, nextCycle);
    }

    const nextReviewItems = prepareMistakeReviewRun({
      items: VERB_QUESTIONS,
      state: reviewState,
      maxMistakes: REVIEW_MISTAKES_PER_RUN,
      getId: (item) => item.id,
      getSkillKey: (item) => item.patternId,
    });
    if (!nextReviewItems.length) return;

    setRunKind(ETrainerRunKind.Mistakes);
    setReviewItems(nextReviewItems);
    setQuestions(nextReviewItems.map((item) => item.question));
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

  function switchMode(nextMode: EVerbAnswerMode) {
    if (result) return;
    setMode(nextMode);
    resetAnswer();
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
    mode,
    questions,
    question,
    index,
    value,
    setValue,
    selectedReflexive,
    setSelectedReflexive,
    selectedPreposition,
    setSelectedPreposition,
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
    orderedPatterns,
    weakSpot,
    statsDrawer,
    openStats,
    openReview,
    choiceAnswer,
    submittedAnswer,
    choiceComplete,
    fullSentence,
    submit,
    goNext,
    startAgain,
    startRegularRun,
    startReview,
    switchMode,
  };
}
