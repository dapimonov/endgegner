"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  PREPOSITION_CHOICES,
  REFLEXIVE_CHOICES,
  VERB_PATTERNS,
  VERB_QUESTIONS,
  VerbQuestion,
} from "./verb-questions";
import {
  advanceCyclicRun,
  completeCyclicRun,
  loadTrainerCycleState,
  prepareCyclicRun,
  saveTrainerCycleState,
  TrainerCycleState,
} from "./trainer-cycle";

type Language = "ru" | "en";
type AnswerMode = "type" | "choice";
type PatternStats = Record<
  string,
  {
    correct: number;
    total: number;
    prepositionErrors: number;
    reflexiveErrors: number;
  }
>;

type VerbTrainerProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onHome: () => void;
  lifetimeCorrect: number;
  onCorrect: () => void;
};

const SESSION_LENGTH = 10;
const TRAINER_ID = "verb-government";
const STATS_KEY = "endgegner-verb-stats";
const MODE_KEY = "endgegner-verb-mode";

const copy = {
  ru: {
    home: "Все тренажёры",
    stats: "Статистика",
    lifetime: "Всего правильных ответов",
    tagline: "Собери полную формулу немецкого глагола.",
    run: "забег",
    streak: "серия",
    typeMode: "ввод",
    choiceMode: "выбор",
    mixedNote: "Разные времена · вопросы · предлоги и возвратность",
    verb: "исходный глагол",
    placeholder: "Например: mich um",
    check: "Проверить",
    chooseReflexive: "Возвратное местоимение",
    choosePreposition: "Предлог",
    correct: "Точно! Формула собрана.",
    wrong: "Почти. В этой конструкции нужна другая связка.",
    yourAnswer: "Твой ответ",
    next: "Дальше",
    finish: "Результат",
    acc: "Akkusativ",
    dat: "Dativ",
    resultTitle: "Забег завершён.",
    resultSubtitle: "Вот как прошли эти десять глагольных конструкций.",
    accuracy: "точность",
    bestStreak: "лучшая серия",
    weakSpot: "Потренировать дальше",
    again: "Ещё один забег",
    statsTitle: "Статистика управления",
    statsSubtitle: "Точность по каждой полной глагольной конструкции.",
    totalAnswers: "всего ответов",
    totalMistakes: "ошибок",
    patternsSeen: "встречалось конструкций",
    patterns: "Глагольные модели",
    correctShort: "верно",
    mistakesShort: "ошибок",
    prepErrors: "предлог",
    reflexiveErrors: "возвратность",
    reflexivePattern: "возвратный",
    plainPattern: "невозвратный",
    noAnswers: "Ответов пока нет",
    noAnswersHint: "Реши хотя бы одно задание — и здесь появится первая конструкция.",
    closeStats: "Закрыть статистику",
    statsNote: "Статистика хранится только на этом устройстве и обновляется после каждого ответа.",
    rulePlain: (frame: string) => `${frame}. Предлог входит в управление глагола, а падеж задаётся этой конструкцией.`,
    ruleReflexive: (frame: string) => `${frame}. Возвратное местоимение согласуется с подлежащим; предлог и падеж относятся ко всей конструкции.`,
  },
  en: {
    home: "All trainers",
    stats: "Statistics",
    lifetime: "Correct answers overall",
    tagline: "Build the complete pattern of a German verb.",
    run: "run",
    streak: "streak",
    typeMode: "type",
    choiceMode: "choose",
    mixedNote: "Mixed tenses · questions · prepositions and reflexivity",
    verb: "base verb",
    placeholder: "For example: mich um",
    check: "Check",
    chooseReflexive: "Reflexive pronoun",
    choosePreposition: "Preposition",
    correct: "Nailed it! The pattern is complete.",
    wrong: "Almost. This construction needs a different combination.",
    yourAnswer: "Your answer",
    next: "Next one",
    finish: "See results",
    acc: "Accusative",
    dat: "Dative",
    resultTitle: "Run complete.",
    resultSubtitle: "Here is how those ten verb patterns went.",
    accuracy: "accuracy",
    bestStreak: "best streak",
    weakSpot: "Train this next",
    again: "Start another run",
    statsTitle: "Verb Pattern Statistics",
    statsSubtitle: "Accuracy for every complete verb pattern.",
    totalAnswers: "total answers",
    totalMistakes: "mistakes",
    patternsSeen: "patterns encountered",
    patterns: "Verb patterns",
    correctShort: "correct",
    mistakesShort: "mistakes",
    prepErrors: "preposition",
    reflexiveErrors: "reflexivity",
    reflexivePattern: "reflexive",
    plainPattern: "non-reflexive",
    noAnswers: "No answers yet",
    noAnswersHint: "Complete at least one exercise and your first pattern will appear here.",
    closeStats: "Close statistics",
    statsNote: "Statistics stay on this device and update after every answer.",
    rulePlain: (frame: string) => `${frame}. The preposition belongs to the verb pattern, and the construction determines the case.`,
    ruleReflexive: (frame: string) => `${frame}. The reflexive pronoun agrees with the subject; the preposition and case belong to the whole pattern.`,
  },
};

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de-DE")
    .replaceAll("ß", "ss")
    .replace(/\s+/g, " ")
    .replace(/[.!?,;:]$/g, "");
}

function bareVerb(value: string) {
  return value.replace(/^sich\s+/, "");
}

export default function VerbTrainer({
  language,
  onLanguageChange,
  onHome,
  lifetimeCorrect,
  onCorrect,
}: VerbTrainerProps) {
  const [mode, setMode] = useState<AnswerMode>("type");
  const [questions, setQuestions] = useState<VerbQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [selectedReflexive, setSelectedReflexive] = useState<string | null>(null);
  const [selectedPreposition, setSelectedPreposition] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [stats, setStats] = useState<PatternStats>({});
  const [cycleState, setCycleState] = useState<TrainerCycleState<number> | null>(null);
  const [restored, setRestored] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = copy[language];
  const question = questions[index];

  useEffect(() => {
    const restore = window.setTimeout(() => {
      let savedStats: PatternStats = {};
      let savedMode: AnswerMode = "type";
      try {
        savedStats = JSON.parse(localStorage.getItem(STATS_KEY) ?? "{}");
        const storedMode = localStorage.getItem(MODE_KEY);
        if (storedMode === "type" || storedMode === "choice") savedMode = storedMode;
      } catch {}

      const savedCycle = loadTrainerCycleState<number>(TRAINER_ID);
      const activeRun = prepareCyclicRun({
        items: VERB_QUESTIONS,
        runSize: SESSION_LENGTH,
        getId: (item) => item.id,
        state: savedCycle,
      });

      setStats(savedStats);
      setMode(savedMode);
      setQuestions(activeRun.items);
      setIndex(activeRun.state.cursor);
      setCycleState(activeRun.state);
      saveTrainerCycleState(TRAINER_ID, activeRun.state);
      setRestored(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(MODE_KEY, mode);
  }, [mode, restored]);

  useEffect(() => {
    if (!statsOpen && !result && !finished && mode === "type") inputRef.current?.focus();
  }, [finished, index, mode, result, statsOpen]);

  useEffect(() => {
    if (!statsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setStatsOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [statsOpen]);

  const choiceAnswer = [question?.reflexiveAnswer ? selectedReflexive : null, selectedPreposition]
    .filter(Boolean)
    .join(" ");
  const submittedAnswer = mode === "type" ? value : choiceAnswer;
  const choiceComplete = Boolean(selectedPreposition) && (!question?.reflexiveAnswer || Boolean(selectedReflexive));
  const fullSentence = question ? `${question.before}${question.answer}${question.after}` : "";

  const statsOverview = useMemo(() => {
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
    return [...VERB_PATTERNS].sort((a, b) => {
      const aStats = stats[a.id];
      const bStats = stats[b.id];
      const aPracticed = Boolean(aStats?.total);
      const bPracticed = Boolean(bStats?.total);
      if (aPracticed !== bPracticed) return aPracticed ? -1 : 1;
      if (aPracticed && bPracticed) {
        const accuracyDifference = aStats.correct / aStats.total - bStats.correct / bStats.total;
        if (accuracyDifference !== 0) return accuracyDifference;
        return bStats.total - aStats.total;
      }
      return a.frame.localeCompare(b.frame, "de");
    });
  }, [stats]);

  const weakSpot = useMemo(() => {
    const entries = Object.entries(stats).filter(([, item]) => item.total > 0);
    if (!entries.length) return null;
    const [patternId] = entries.sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total)[0];
    return VERB_PATTERNS.find((pattern) => pattern.id === patternId)?.frame ?? null;
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
    const candidate = mode === "type" ? value : choiceAnswer;
    if (!candidate.trim()) return;

    const normalizedCandidate = normalize(candidate);
    const normalizedExpected = normalize(question.answer);
    const tokens = normalizedCandidate.split(" ").filter(Boolean);
    const prepositionCorrect = tokens.at(-1) === question.preposition;
    const reflexiveCorrect = question.reflexiveAnswer
      ? tokens[0] === question.reflexiveAnswer
      : true;
    const isCorrect = normalizedCandidate === normalizedExpected;
    const patternStats = stats[question.patternId] ?? {
      correct: 0,
      total: 0,
      prepositionErrors: 0,
      reflexiveErrors: 0,
    };
    const nextStats: PatternStats = {
      ...stats,
      [question.patternId]: {
        correct: patternStats.correct + (isCorrect ? 1 : 0),
        total: patternStats.total + 1,
        prepositionErrors: patternStats.prepositionErrors + (!prepositionCorrect ? 1 : 0),
        reflexiveErrors: patternStats.reflexiveErrors + (!reflexiveCorrect ? 1 : 0),
      },
    };
    const nextStreak = isCorrect ? streak + 1 : 0;

    setStats(nextStats);
    setResult(isCorrect ? "correct" : "wrong");
    setStreak(nextStreak);
    setBestStreak((current) => Math.max(current, nextStreak));
    if (isCorrect) {
      setCorrectCount((current) => current + 1);
      onCorrect();
    }
    localStorage.setItem(STATS_KEY, JSON.stringify(nextStats));
  }

  function goNext() {
    if (index === questions.length - 1) {
      if (cycleState) {
        const completedCycle = completeCyclicRun(cycleState);
        setCycleState(completedCycle);
        saveTrainerCycleState(TRAINER_ID, completedCycle);
      }
      setFinished(true);
      return;
    }
    if (cycleState) {
      const advancedCycle = advanceCyclicRun(cycleState);
      setCycleState(advancedCycle);
      saveTrainerCycleState(TRAINER_ID, advancedCycle);
    }
    setIndex((current) => current + 1);
    resetAnswer();
  }

  function startAgain() {
    const nextRun = prepareCyclicRun({
      items: VERB_QUESTIONS,
      runSize: SESSION_LENGTH,
      getId: (item) => item.id,
      state: cycleState ?? loadTrainerCycleState<number>(TRAINER_ID),
    });
    setQuestions(nextRun.items);
    setIndex(nextRun.state.cursor);
    setCycleState(nextRun.state);
    saveTrainerCycleState(TRAINER_ID, nextRun.state);
    resetAnswer();
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
  }

  function switchMode(nextMode: AnswerMode) {
    if (result) return;
    setMode(nextMode);
    resetAnswer();
  }

  const header = (
    <header className="topbar">
      <button className="brand brand-button" onClick={onHome} aria-label={t.home}>
        <span className="brand-mark">E</span>
        <span>ENDGEGNER</span>
      </button>
      <div className="topbar-controls">
        <button className="back-home" onClick={onHome}><span>←</span>{t.home}</button>
        <button className="stats-trigger" onClick={() => setStatsOpen(true)}>
          <span className="stats-trigger-icon" aria-hidden="true"><i /><i /><i /></span>
          <span className="stats-trigger-label">{t.stats}</span>
        </button>
        <div className="segmented compact" aria-label="Interface language">
          {(["ru", "en"] as Language[]).map((item) => (
            <button key={item} className={language === item ? "active" : ""} onClick={() => onLanguageChange(item)}>
              {item.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="lifetime" title={t.lifetime}>
          <span className="spark">✦</span> {lifetimeCorrect}
        </div>
      </div>
    </header>
  );

  if (!question) {
    return (
      <main className="app-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        {header}
      </main>
    );
  }

  return (
    <main className="app-shell verb-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      {header}

      <section className="trainer-wrap">
        <div className="intro-line"><p>{t.tagline}</p></div>

        {!finished ? (
          <article className={`trainer-card verb-card ${result ? `has-${result}` : ""}`}>
            <div className="card-topline">
              <div className="run-label">{t.run} <strong>{String(index + 1).padStart(2, "0")}/{SESSION_LENGTH}</strong></div>
              <div className="run-stats"><span>{t.streak} <strong>×{streak}</strong></span></div>
            </div>

            <div className="run-progress" aria-label={`${index + 1} of ${SESSION_LENGTH}`}>
              <span style={{ width: `${((index + (result ? 1 : 0)) / SESSION_LENGTH) * 100}%` }} />
            </div>

            <div className="mode-row">
              <div className="segmented mode-switch">
                <button disabled={Boolean(result)} className={mode === "type" ? "active" : ""} onClick={() => switchMode("type")}>{t.typeMode}</button>
                <button disabled={Boolean(result)} className={mode === "choice" ? "active" : ""} onClick={() => switchMode("choice")}>{t.choiceMode}</button>
              </div>
              <p>{t.mixedNote}</p>
            </div>

            <div className="exercise">
              <div className="lemma-label verb-lemma">
                <span>{t.verb}</span>
                <strong>{bareVerb(question.verb)}</strong>
              </div>

              <div className="sentence verb-sentence" aria-live="polite">
                <span>{question.before}</span>
                {result ? (
                  <strong className="revealed-answer">{question.answer}</strong>
                ) : mode === "choice" && choiceAnswer ? (
                  <strong className="slot-preview">{choiceAnswer}</strong>
                ) : (
                  <span className="sentence-gap" aria-hidden="true">••••••</span>
                )}
                <span>{question.after}</span>
              </div>

              {!result && mode === "type" && (
                <form className="answer-form" onSubmit={submit}>
                  <input
                    ref={inputRef}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={t.placeholder}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label={t.placeholder}
                  />
                  <button className="primary-button" type="submit" disabled={!value.trim()}>{t.check}<span>↗</span></button>
                </form>
              )}

              {!result && mode === "choice" && (
                <div className="choice-panel">
                  {question.reflexiveAnswer && (
                    <div className="choice-group">
                      <p>{t.chooseReflexive}</p>
                      <div className="choice-grid reflexive-choice-grid">
                        {REFLEXIVE_CHOICES.map((item) => (
                          <button key={item} className={selectedReflexive === item ? "selected" : ""} onClick={() => setSelectedReflexive(item)}>{item}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="choice-group">
                    <p>{t.choosePreposition}</p>
                    <div className="choice-grid preposition-choice-grid">
                      {PREPOSITION_CHOICES.map((item) => (
                        <button key={item} className={selectedPreposition === item ? "selected" : ""} onClick={() => setSelectedPreposition(item)}>{item}</button>
                      ))}
                    </div>
                  </div>
                  <button className="primary-button wide" onClick={() => submit()} disabled={!choiceComplete}>{t.check}<span>↗</span></button>
                </div>
              )}

              {result && (
                <div className={`feedback ${result}`}>
                  <div className="feedback-heading">
                    <span className="feedback-icon">{result === "correct" ? "✓" : "↗"}</span>
                    <div>
                      <h2>{result === "correct" ? t.correct : t.wrong}</h2>
                      <p>{fullSentence}</p>
                    </div>
                  </div>
                  <div className="grammar-tags">
                    <span>{question.frame}</span>
                    <span>{t[question.caseKey]}</span>
                    <span>{question.tense}</span>
                    {question.isQuestion && <span>Frage</span>}
                  </div>
                  <p className="rule"><b>{question.verb}</b> — {question.reflexiveAnswer ? t.ruleReflexive(question.frame) : t.rulePlain(question.frame)}</p>
                  {result === "wrong" && <p className="submitted-answer">{t.yourAnswer}: <s>{submittedAnswer || "—"}</s></p>}
                  <button className="primary-button feedback-next" onClick={goNext}>
                    {index === questions.length - 1 ? t.finish : t.next}<span>→</span>
                  </button>
                </div>
              )}
            </div>
          </article>
        ) : (
          <article className="result-card">
            <div className="result-burst">{correctCount}<small>/{SESSION_LENGTH}</small></div>
            <h1>{t.resultTitle}</h1>
            <p className="result-subtitle">{t.resultSubtitle}</p>
            <div className="result-grid">
              <div><strong>{Math.round((correctCount / SESSION_LENGTH) * 100)}%</strong><span>{t.accuracy}</span></div>
              <div><strong>×{bestStreak}</strong><span>{t.bestStreak}</span></div>
            </div>
            {weakSpot && <div className="weak-spot"><span>{t.weakSpot}</span><strong>{weakSpot}</strong></div>}
            <button className="primary-button result-button" onClick={startAgain}>{t.again}<span>↻</span></button>
          </article>
        )}
      </section>

      <footer>
        <span>VERBREKTION / 02</span>
        <span>LEARN THE PATTERN, NOT THE LIST.</span>
      </footer>

      {statsOpen && (
        <div className="stats-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setStatsOpen(false); }}>
          <aside className="stats-drawer verb-stats-drawer" role="dialog" aria-modal="true" aria-labelledby="verb-stats-title">
            <div className="stats-drawer-header">
              <div>
                <p>VERBREKTION / STATS</p>
                <h2 id="verb-stats-title">{t.statsTitle}</h2>
                <span>{t.statsSubtitle}</span>
              </div>
              <button className="stats-close" onClick={() => setStatsOpen(false)} aria-label={t.closeStats} autoFocus>×</button>
            </div>

            {statsOverview.total === 0 ? (
              <div className="stats-empty">
                <div className="stats-empty-mark">%</div>
                <h3>{t.noAnswers}</h3>
                <p>{t.noAnswersHint}</p>
              </div>
            ) : (
              <>
                <div className="stats-overview verb-stats-overview">
                  <div><span>{t.totalAnswers}</span><strong>{statsOverview.total}</strong></div>
                  <div className="stats-overview-accent"><span>{t.accuracy}</span><strong>{Math.round((statsOverview.correct / statsOverview.total) * 100)}%</strong></div>
                  <div><span>{t.totalMistakes}</span><strong>{statsOverview.mistakes}</strong></div>
                  <div><span>{t.patternsSeen}</span><strong>{statsOverview.practiced}<small>/{VERB_PATTERNS.length}</small></strong></div>
                </div>

                <section className="verb-pattern-stats" aria-labelledby="verb-patterns-title">
                  <div className="stats-section-title">
                    <h3 id="verb-patterns-title">{t.patterns}</h3>
                    <span>{String(statsOverview.practiced).padStart(2, "0")} / {VERB_PATTERNS.length}</span>
                  </div>
                  <div className="verb-pattern-list">
                    {orderedPatterns.map((pattern) => {
                      const item = stats[pattern.id] ?? { correct: 0, total: 0, prepositionErrors: 0, reflexiveErrors: 0 };
                      const mistakes = item.total - item.correct;
                      const percentage = item.total ? Math.round((item.correct / item.total) * 100) : 0;
                      return (
                        <article key={pattern.id} className={`verb-pattern-row ${item.total ? "" : "is-empty"}`}>
                          <div className="verb-pattern-copy">
                            <strong>{pattern.frame}</strong>
                            <span>{t[pattern.caseKey]} · {pattern.reflexive ? t.reflexivePattern : t.plainPattern}</span>
                            {item.total > 0 && (
                              <small>
                                {t.prepErrors}: {item.prepositionErrors}
                                {pattern.reflexive && <> · {t.reflexiveErrors}: {item.reflexiveErrors}</>}
                              </small>
                            )}
                          </div>
                          <div className="verb-pattern-metric">
                            <strong>{item.total ? `${percentage}%` : "—"}</strong>
                            <span><b>✓ {item.correct}</b><i>× {mistakes}</i></span>
                          </div>
                          <i className="verb-pattern-meter"><i style={{ width: `${percentage}%` }} /></i>
                        </article>
                      );
                    })}
                  </div>
                </section>
                <p className="stats-note">{t.statsNote}</p>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
