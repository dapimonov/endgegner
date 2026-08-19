import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { QUESTIONS, type IQuestion } from "./data/questions";
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
  EAdjectiveAnswerMode,
  EAnswerResult,
  EMistakeReviewStep,
  ETrainerRunKind,
  type IAdjectiveStats,
} from "../../shared/model";
import {
  ADJECTIVE_ARTICLES,
  ADJECTIVE_CASES,
  ADJECTIVE_ENDINGS,
  ADJECTIVE_GENDERS,
  ADJECTIVE_SESSION_LENGTH,
  ADJECTIVE_TRAINER_ID,
  adjectiveSkillKey,
} from "./adjective.model";

const STATS_KEY = "endgegner-stats";
const REVIEW_MISTAKES_PER_RUN = 5;

export interface IUseAdjectiveTrainerOptions {
  mode: EAdjectiveAnswerMode;
  setMode: (mode: EAdjectiveAnswerMode) => void;
  onCorrect: () => void;
}

export interface IArticleStatsOverview {
  correct: number;
  total: number;
  mistakes: number;
}

export interface IAdjectiveStatsOverview {
  byArticle: Record<IQuestion["article"], IArticleStatsOverview>;
  correct: number;
  total: number;
  mistakes: number;
}

export function useAdjectiveTrainer({
  mode,
  setMode,
  onCorrect,
}: IUseAdjectiveTrainerOptions) {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [selectedEnding, setSelectedEnding] = useState<
    IQuestion["ending"] | null
  >(null);
  const [result, setResult] = useState<EAnswerResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [stats, setStats] = useState<IAdjectiveStats>({});
  const [finished, setFinished] = useState(false);
  const [activeStatsArticle, setActiveStatsArticle] = useState<
    IQuestion["article"]
  >("definite");
  const [cycleState, setCycleState] = useState<
    ITrainerCycleState<number> | null
  >(null);
  const [runKind, setRunKind] = useState(ETrainerRunKind.Regular);
  const [reviewState, setReviewState] = useState<
    IMistakeReviewState<number>
  >({ active: [], masteredIds: [] });
  const [reviewItems, setReviewItems] = useState<
    IMistakeReviewRunItem<IQuestion, number>[]
  >([]);
  const [masteredAtRunStart, setMasteredAtRunStart] = useState(0);
  const statsDrawer = useStatsDrawer();
  const reviewDrawer = useStatsDrawer();
  const question = questions[index];
  const reviewItem =
    runKind === ETrainerRunKind.Mistakes ? reviewItems[index] : null;

  useEffect(() => {
    const restore = window.setTimeout(() => {
      let savedStats: IAdjectiveStats = {};
      try {
        savedStats = JSON.parse(localStorage.getItem(STATS_KEY) ?? "{}");
      } catch {
        savedStats = {};
      }

      const savedCycle = loadTrainerCycleState<number>(ADJECTIVE_TRAINER_ID);
      const savedReview = loadMistakeReviewState<number>(
        ADJECTIVE_TRAINER_ID,
      );
      const activeRun = prepareCyclicRun({
        items: QUESTIONS,
        runSize: ADJECTIVE_SESSION_LENGTH,
        getId: (item) => item.id,
        state: savedCycle,
      });

      setStats(savedStats);
      setQuestions(activeRun.items);
      setIndex(activeRun.state.cursor);
      setCycleState(activeRun.state);
      setReviewState(savedReview);
      saveTrainerCycleState(ADJECTIVE_TRAINER_ID, activeRun.state);
    }, 0);

    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (
        statsDrawer.isOpen ||
        reviewDrawer.isOpen ||
        finished ||
        result ||
        mode !== EAdjectiveAnswerMode.Ending
      ) {
        return;
      }
      const shortcutIndex = Number(event.key) - 1;
      if (shortcutIndex >= 0 && shortcutIndex < ADJECTIVE_ENDINGS.length) {
        event.preventDefault();
        setSelectedEnding(ADJECTIVE_ENDINGS[shortcutIndex]);
      }
      if (event.key === "Enter" && selectedEnding) {
        event.preventDefault();
        document.getElementById("adjective-ending-submit")?.click();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [
    finished,
    mode,
    result,
    reviewDrawer.isOpen,
    selectedEnding,
    statsDrawer.isOpen,
  ]);

  const answerForSentence = useMemo(() => {
    if (!question) return "";
    return question.before.length === 0
      ? question.answer.charAt(0).toUpperCase() + question.answer.slice(1)
      : question.answer;
  }, [question]);

  const fullSentence = question
    ? `${question.before}${answerForSentence}${question.after}`
    : "";

  const weakSpotKey = useMemo(() => {
    const entries = Object.entries(stats).filter(([, item]) => item.total > 0);
    if (!entries.length) return null;
    return entries.sort(
      ([, first], [, second]) =>
        first.correct / first.total - second.correct / second.total,
    )[0][0];
  }, [stats]);

  const statsOverview = useMemo<IAdjectiveStatsOverview>(() => {
    const byArticle = {} as Record<
      IQuestion["article"],
      IArticleStatsOverview
    >;
    let correct = 0;
    let total = 0;

    for (const article of ADJECTIVE_ARTICLES) {
      let articleCorrect = 0;
      let articleTotal = 0;
      for (const caseKey of ADJECTIVE_CASES) {
        for (const gender of ADJECTIVE_GENDERS) {
          const item = stats[`${caseKey}-${gender}-${article}`];
          articleCorrect += item?.correct ?? 0;
          articleTotal += item?.total ?? 0;
        }
      }
      byArticle[article] = {
        correct: articleCorrect,
        total: articleTotal,
        mistakes: articleTotal - articleCorrect,
      };
      correct += articleCorrect;
      total += articleTotal;
    }

    return { byArticle, correct, total, mistakes: total - correct };
  }, [stats]);

  function resetAnswer() {
    setValue("");
    setSelectedEnding(null);
    setResult(null);
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (result || !question) return;

    const candidate =
      mode === EAdjectiveAnswerMode.Word ? value : selectedEnding ?? "";
    if (!candidate) return;
    const expected =
      mode === EAdjectiveAnswerMode.Word
        ? question.answer
        : question.ending;
    const isCorrect =
      normalizeAnswer(candidate.replace(/^[-–—]/, "")) ===
      normalizeAnswer(expected);
    const nextStreak = isCorrect ? streak + 1 : 0;
    const key = adjectiveSkillKey(question);

    setResult(isCorrect ? EAnswerResult.Correct : EAnswerResult.Wrong);
    setStreak(nextStreak);
    setBestStreak((current) => Math.max(current, nextStreak));
    if (isCorrect) {
      setCorrectCount((current) => current + 1);
    }

    if (runKind === ETrainerRunKind.Regular) {
      const nextStats: IAdjectiveStats = {
        ...stats,
        [key]: {
          correct: (stats[key]?.correct ?? 0) + (isCorrect ? 1 : 0),
          total: (stats[key]?.total ?? 0) + 1,
        },
      };
      setStats(nextStats);
      localStorage.setItem(STATS_KEY, JSON.stringify(nextStats));

      if (isCorrect) {
        onCorrect();
      } else {
        const nextReviewState = registerMistake(
          reviewState,
          question.id,
          key,
        );
        setReviewState(nextReviewState);
        saveMistakeReviewState(ADJECTIVE_TRAINER_ID, nextReviewState);
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
      saveMistakeReviewState(ADJECTIVE_TRAINER_ID, nextReviewState);

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
        saveTrainerCycleState(ADJECTIVE_TRAINER_ID, completedCycle);
      }
      setFinished(true);
      return;
    }
    if (runKind === ETrainerRunKind.Regular && cycleState) {
      const advancedCycle = advanceCyclicRun(cycleState);
      setCycleState(advancedCycle);
      saveTrainerCycleState(ADJECTIVE_TRAINER_ID, advancedCycle);
    }
    setIndex((current) => current + 1);
    resetAnswer();
  }

  function startRegularRun() {
    const nextRun = prepareCyclicRun({
      items: QUESTIONS,
      runSize: ADJECTIVE_SESSION_LENGTH,
      getId: (item) => item.id,
      state:
        cycleState ??
        loadTrainerCycleState<number>(ADJECTIVE_TRAINER_ID),
    });
    setQuestions(nextRun.items);
    setReviewItems([]);
    setRunKind(ETrainerRunKind.Regular);
    setIndex(nextRun.state.cursor);
    setCycleState(nextRun.state);
    saveTrainerCycleState(ADJECTIVE_TRAINER_ID, nextRun.state);
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
      saveTrainerCycleState(ADJECTIVE_TRAINER_ID, nextCycle);
    }

    const nextReviewItems = prepareMistakeReviewRun({
      items: QUESTIONS,
      state: reviewState,
      maxMistakes: REVIEW_MISTAKES_PER_RUN,
      getId: (item) => item.id,
      getSkillKey: adjectiveSkillKey,
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

  function switchMode(nextMode: EAdjectiveAnswerMode) {
    if (result) return;
    setMode(nextMode);
    resetAnswer();
  }

  function openStats() {
    const mostPracticed = ADJECTIVE_ARTICLES.reduce((best, article) =>
      statsOverview.byArticle[article].total >
      statsOverview.byArticle[best].total
        ? article
        : best,
    );
    setActiveStatsArticle(mostPracticed);
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
    selectedEnding,
    setSelectedEnding,
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
    activeStatsArticle,
    setActiveStatsArticle,
    answerForSentence,
    fullSentence,
    weakSpotKey,
    statsDrawer,
    openStats,
    openReview,
    submit,
    goNext,
    startAgain,
    startRegularRun,
    startReview,
    switchMode,
  };
}
