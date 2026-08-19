"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArticleKey,
  CaseKey,
  Ending,
  GenderKey,
  Question,
  QUESTIONS,
} from "./questions";
import {
  advanceCyclicRun,
  completeCyclicRun,
  loadTrainerCycleState,
  prepareCyclicRun,
  saveTrainerCycleState,
  TrainerCycleState,
} from "./trainer-cycle";
import VerbTrainer from "./verb-trainer";

type Language = "ru" | "en";
type AnswerMode = "word" | "ending";
type AppView = "home" | "adjective" | "verb";
type SkillStats = Record<string, { correct: number; total: number }>;

const SESSION_LENGTH = 10;
const TRAINER_ID = "adjective-endings";
const ENDINGS: Ending[] = ["e", "en", "er", "es", "em"];
const CASES: CaseKey[] = ["nom", "acc", "dat", "gen"];
const GENDERS: GenderKey[] = ["m", "f", "n", "pl"];
const ARTICLES: ArticleKey[] = ["definite", "ein", "quantity", "zero"];
const ARTICLE_MARKS: Record<ArticleKey, string> = { definite: "DER", ein: "EIN", quantity: "VIEL", zero: "Ø" };

const copy = {
  ru: {
    homeEyebrow: "ТВОЯ АРЕНА НЕМЕЦКОГО",
    homeTitleStart: "Выбери своего",
    homeTitleAccent: "противника.",
    homeSubtitle: "Немецкий любит выставлять правила как боссов. Разбираем их по одному — короткими забегами, без зубрёжки таблиц.",
    trainers: "Тренажёры",
    available: "доступно",
    adjectiveTitle: "Окончания прилагательных",
    adjectiveDescription: "Ставь правильную форму в живом предложении и сразу разбирай грамматический сигнал.",
    verbTitle: "Управление глаголов",
    verbDescription: "Собирай глагол вместе с нужным предлогом, падежом и возвратным местоимением.",
    enterArena: "В бой",
    moreSoon: "Новые противники появятся здесь позже.",
    home: "Все тренажёры",
    stats: "Статистика",
    statsTitle: "Статистика окончаний",
    statsSubtitle: "Все ответы в разрезе падежа, рода и типа артикля.",
    statsBreakdown: "Падеж × род",
    articleType: "Тип артикля",
    answersShort: "отв.",
    totalAnswers: "всего ответов",
    totalCorrect: "правильно",
    totalMistakes: "ошибок",
    noAnswers: "Ответов пока нет",
    noAnswersHint: "Реши хотя бы одно задание — и здесь появится первая ячейка.",
    correctShort: "верно",
    mistakesShort: "ошибок",
    statsNote: "Статистика хранится только на этом устройстве и обновляется после каждого ответа.",
    closeStats: "Закрыть статистику",
    tagline: "Победи окончания немецких прилагательных.",
    run: "забег",
    streak: "серия",
    wordMode: "слово",
    endingMode: "окончание",
    adjective: "исходное прилагательное",
    placeholder: "Введи форму целиком",
    check: "Проверить",
    choose: "Выбери окончание",
    correct: "Точно!",
    wrong: "Почти. Нужна другая форма.",
    yourAnswer: "Твой ответ",
    next: "Дальше",
    finish: "Результат",
    mixedNote: "Все падежи · все артикли · без подсказок по теме",
    resultTitle: "Забег завершён.",
    resultSubtitle: "Вот как прошли эти десять заданий.",
    accuracy: "точность",
    bestStreak: "лучшая серия",
    weakSpot: "Потренировать дальше",
    again: "Ещё один забег",
    lifetime: "Всего правильных ответов",
    definite: "der-слово",
    ein: "ein-слово",
    quantity: "слово количества",
    zero: "без артикля",
    nom: "Nominativ",
    acc: "Akkusativ",
    dat: "Dativ",
    gen: "Genitiv",
    m: "мужской род",
    f: "женский род",
    n: "средний род",
    pl: "множественное число",
    ruleDefinite: (ending: string) => `Слово перед прилагательным работает по модели определённого артикля и уже несёт грамматический сигнал. Поэтому прилагательное получает -${ending}.`,
    ruleEin: (ending: string) => `Слово перед прилагательным работает по модели неопределённого артикля. В этой форме прилагательное получает -${ending}.`,
    ruleQuantity: (ending: string) => `Перед существительным стоит слово количества. В этой форме прилагательное получает -${ending}.`,
    ruleZero: (ending: string) => `Артикля нет, поэтому прилагательное само несёт грамматический сигнал: -${ending}.`,
  },
  en: {
    homeEyebrow: "YOUR GERMAN TRAINING ARENA",
    homeTitleStart: "Choose your next",
    homeTitleAccent: "opponent.",
    homeSubtitle: "German likes to turn rules into boss fights. We take them down one at a time — in quick runs, without memorising tables.",
    trainers: "Trainers",
    available: "ready",
    adjectiveTitle: "Adjective endings",
    adjectiveDescription: "Build the right form inside a real sentence and see the grammar signal immediately.",
    verbTitle: "Prepositions & Reflexive Verbs",
    verbDescription: "Build German verb patterns with the right preposition, case, and reflexive pronoun.",
    enterArena: "Enter arena",
    moreSoon: "New opponents will appear here later.",
    home: "All trainers",
    stats: "Statistics",
    statsTitle: "Ending statistics",
    statsSubtitle: "All answers broken down by case, gender, and article type.",
    statsBreakdown: "Case × gender",
    articleType: "Article type",
    answersShort: "ans.",
    totalAnswers: "total answers",
    totalCorrect: "correct",
    totalMistakes: "mistakes",
    noAnswers: "No answers yet",
    noAnswersHint: "Complete at least one exercise and your first cell will appear here.",
    correctShort: "correct",
    mistakesShort: "mistakes",
    statsNote: "Statistics stay on this device and update after every answer.",
    closeStats: "Close statistics",
    tagline: "Beat German adjective endings.",
    run: "run",
    streak: "streak",
    wordMode: "full word",
    endingMode: "ending",
    adjective: "base adjective",
    placeholder: "Type the full form",
    check: "Check",
    choose: "Choose the ending",
    correct: "Nailed it!",
    wrong: "Almost. This form needs a fix.",
    yourAnswer: "Your answer",
    next: "Next one",
    finish: "See results",
    mixedNote: "Every case · every article · no topic hints",
    resultTitle: "Run complete.",
    resultSubtitle: "Here is how those ten exercises went.",
    accuracy: "accuracy",
    bestStreak: "best streak",
    weakSpot: "Train this next",
    again: "Start another run",
    lifetime: "Correct answers overall",
    definite: "der-word",
    ein: "ein-word",
    quantity: "quantity word",
    zero: "no article",
    nom: "Nominative",
    acc: "Accusative",
    dat: "Dative",
    gen: "Genitive",
    m: "masculine",
    f: "feminine",
    n: "neuter",
    pl: "plural",
    ruleDefinite: (ending: string) => `The word before the adjective follows the definite-article pattern and already carries the grammar signal. The adjective therefore takes -${ending}.`,
    ruleEin: (ending: string) => `The word before the adjective follows the indefinite-article pattern. The adjective takes -${ending} in this form.`,
    ruleQuantity: (ending: string) => `A quantity word comes before the noun. The adjective takes -${ending} in this form.`,
    ruleZero: (ending: string) => `There is no article, so the adjective carries the grammar signal: -${ending}.`,
  },
};

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de-DE")
    .replaceAll("ß", "ss")
    .replace(/[.!?,;:]$/g, "");
}

function skillKey(question: Question) {
  return `${question.caseKey}-${question.gender}-${question.article}`;
}

export default function Home() {
  const [view, setView] = useState<AppView>("home");
  const [language, setLanguage] = useState<Language>("ru");
  const [mode, setMode] = useState<AnswerMode>("word");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [selectedEnding, setSelectedEnding] = useState<Ending | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [stats, setStats] = useState<SkillStats>({});
  const [lifetimeCorrect, setLifetimeCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [activeStatsArticle, setActiveStatsArticle] = useState<ArticleKey>("definite");
  const [cycleState, setCycleState] = useState<TrainerCycleState<number> | null>(null);
  const [restored, setRestored] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endingSubmitRef = useRef<HTMLButtonElement>(null);

  const t = copy[language];
  const question = questions[index];

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const preferences = JSON.parse(localStorage.getItem("endgegner-preferences") ?? "{}");
        const savedStats = JSON.parse(localStorage.getItem("endgegner-stats") ?? "{}");
        const savedCorrect = Number(localStorage.getItem("endgegner-correct") ?? 0);
        if (preferences.language === "ru" || preferences.language === "en") setLanguage(preferences.language);
        if (preferences.mode === "word" || preferences.mode === "ending") setMode(preferences.mode);
        setStats(savedStats);
        setLifetimeCorrect(savedCorrect);
        const savedCycle = loadTrainerCycleState<number>(TRAINER_ID);
        setCycleState(savedCycle);
        if (savedCycle?.activeRunIds.length) {
          const activeRun = prepareCyclicRun({
            items: QUESTIONS,
            runSize: SESSION_LENGTH,
            getId: (item) => item.id,
            state: savedCycle,
          });
          setQuestions(activeRun.items);
          setIndex(activeRun.state.cursor);
          setCycleState(activeRun.state);
          saveTrainerCycleState(TRAINER_ID, activeRun.state);
        }
      } catch {}
      setRestored(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem("endgegner-preferences", JSON.stringify({ language, mode }));
  }, [language, mode, restored]);

  useEffect(() => {
    if (view === "adjective" && !statsOpen && !result && mode === "word") inputRef.current?.focus();
  }, [index, mode, result, statsOpen, view]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (view !== "adjective" || statsOpen || finished || result || mode !== "ending") return;
      const shortcutIndex = Number(event.key) - 1;
      if (shortcutIndex >= 0 && shortcutIndex < ENDINGS.length) {
        event.preventDefault();
        setSelectedEnding(ENDINGS[shortcutIndex]);
      }
      if (event.key === "Enter" && selectedEnding) {
        event.preventDefault();
        endingSubmitRef.current?.click();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [finished, mode, result, selectedEnding, statsOpen, view]);

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

  const answerForSentence = useMemo(() => {
    if (!question) return "";
    return question.before.length === 0
      ? question.answer.charAt(0).toUpperCase() + question.answer.slice(1)
      : question.answer;
  }, [question]);

  const fullSentence = question ? `${question.before}${answerForSentence}${question.after}` : "";

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (result || !question) return;

    const candidate = mode === "word" ? value : selectedEnding ?? "";
    if (!candidate) return;
    const expected = mode === "word" ? question.answer : question.ending;
    const isCorrect = normalize(candidate.replace(/^[-–—]/, "")) === normalize(expected);
    const nextStreak = isCorrect ? streak + 1 : 0;
    const key = skillKey(question);
    const nextStats = {
      ...stats,
      [key]: {
        correct: (stats[key]?.correct ?? 0) + (isCorrect ? 1 : 0),
        total: (stats[key]?.total ?? 0) + 1,
      },
    };

    setResult(isCorrect ? "correct" : "wrong");
    setStats(nextStats);
    setStreak(nextStreak);
    setBestStreak((current) => Math.max(current, nextStreak));
    if (isCorrect) {
      setCorrectCount((current) => current + 1);
      setLifetimeCorrect((current) => {
        const next = current + 1;
        localStorage.setItem("endgegner-correct", String(next));
        return next;
      });
    }
    localStorage.setItem("endgegner-stats", JSON.stringify(nextStats));
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
    setValue("");
    setSelectedEnding(null);
    setResult(null);
  }

  function startAgain() {
    prepareSession();
    setValue("");
    setSelectedEnding(null);
    setResult(null);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
  }

  function switchMode(nextMode: AnswerMode) {
    if (result) return;
    setMode(nextMode);
    setValue("");
    setSelectedEnding(null);
    setResult(null);
  }

  function ruleText(current: Question) {
    if (current.article === "definite") return t.ruleDefinite(current.ending);
    if (current.article === "ein") return t.ruleEin(current.ending);
    if (current.article === "quantity") return t.ruleQuantity(current.ending);
    return t.ruleZero(current.ending);
  }

  function prepareSession() {
    const nextRun = prepareCyclicRun({
      items: QUESTIONS,
      runSize: SESSION_LENGTH,
      getId: (item) => item.id,
      state: cycleState ?? loadTrainerCycleState<number>(TRAINER_ID),
    });
    setQuestions(nextRun.items);
    setIndex(nextRun.state.cursor);
    setCycleState(nextRun.state);
    saveTrainerCycleState(TRAINER_ID, nextRun.state);
  }

  function enterTrainer() {
    if (!questions.length) prepareSession();
    setView("adjective");
  }

  function enterVerbTrainer() {
    setView("verb");
  }

  function registerLifetimeCorrect() {
    setLifetimeCorrect((current) => {
      const next = current + 1;
      localStorage.setItem("endgegner-correct", String(next));
      return next;
    });
  }

  const weakSpot = useMemo(() => {
    const entries = Object.entries(stats).filter(([, item]) => item.total > 0);
    if (!entries.length) return null;
    const [key] = entries.sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total)[0];
    const [caseKey, gender, article] = key.split("-") as [CaseKey, GenderKey, ArticleKey];
    return `${t[caseKey]} · ${t[gender]} · ${t[article]}`;
  }, [stats, t]);

  const statsOverview = useMemo(() => {
    const byArticle = {} as Record<ArticleKey, { correct: number; total: number; mistakes: number }>;
    let correct = 0;
    let total = 0;

    for (const article of ARTICLES) {
      let articleCorrect = 0;
      let articleTotal = 0;
      for (const caseKey of CASES) {
        for (const gender of GENDERS) {
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

  function openStats() {
    const mostPracticed = ARTICLES.reduce((best, article) =>
      statsOverview.byArticle[article].total > statsOverview.byArticle[best].total ? article : best,
    );
    setActiveStatsArticle(mostPracticed);
    setStatsOpen(true);
  }

  function goHome() {
    setStatsOpen(false);
    setView("home");
  }

  if (view === "home") {
    return (
      <main className="app-shell home-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        <header className="topbar">
          <div className="brand" aria-label="Endgegner home">
            <span className="brand-mark">E</span>
            <span>ENDGEGNER</span>
          </div>
          <div className="topbar-controls">
            <div className="segmented compact" aria-label="Interface language">
              {(["ru", "en"] as Language[]).map((item) => (
                <button key={item} className={language === item ? "active" : ""} onClick={() => setLanguage(item)}>
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="lifetime" title={t.lifetime}>
              <span className="spark">✦</span> {lifetimeCorrect}
            </div>
          </div>
        </header>

        <section className="home-main">
          <div className="home-hero">
            <p className="home-eyebrow"><span />{t.homeEyebrow}</p>
            <h1>{t.homeTitleStart} <em>{t.homeTitleAccent}</em></h1>
            <p className="home-subtitle">{t.homeSubtitle}</p>
          </div>

          <div className="trainer-section-heading">
            <h2>{t.trainers}</h2>
            <span>02 / —</span>
          </div>

          <div className="trainer-grid">
            <button className="trainer-tile" onClick={enterTrainer}>
              <div className="tile-copy">
                <div className="tile-topline">
                  <span className="tile-number">01</span>
                  <span className="tile-status"><i />{t.available}</span>
                </div>
                <div>
                  <p className="tile-category">ADJEKTIV-DEKLINATION</p>
                  <h3>{t.adjectiveTitle}</h3>
                  <p className="tile-description">{t.adjectiveDescription}</p>
                </div>
                <div className="tile-bottom">
                  <strong>{t.enterArena} <i>→</i></strong>
                </div>
              </div>
              <div className="tile-visual" aria-hidden="true">
                <span className="tile-orbit" />
                <strong>alt<em>__</em></strong>
                <small>-e · -en · -er · -es · -em</small>
              </div>
            </button>

            <button className="trainer-tile verb-tile" onClick={enterVerbTrainer}>
              <div className="tile-copy">
                <div className="tile-topline">
                  <span className="tile-number">02</span>
                  <span className="tile-status"><i />{t.available}</span>
                </div>
                <div>
                  <p className="tile-category">VERBREKTION</p>
                  <h3>{t.verbTitle}</h3>
                  <p className="tile-description">{t.verbDescription}</p>
                </div>
                <div className="tile-bottom">
                  <strong>{t.enterArena} <i>→</i></strong>
                </div>
              </div>
              <div className="tile-visual" aria-hidden="true">
                <span className="tile-orbit" />
                <strong><em>sich</em> __</strong>
                <small>an · auf · mit · über · um</small>
              </div>
            </button>
          </div>

          <p className="more-soon">↳ {t.moreSoon}</p>
        </section>

        <footer>
          <span>ENDGEGNER / ARENA 02</span>
        </footer>
      </main>
    );
  }

  if (view === "verb") {
    return (
      <VerbTrainer
        language={language}
        onLanguageChange={setLanguage}
        onHome={goHome}
        lifetimeCorrect={lifetimeCorrect}
        onCorrect={registerLifetimeCorrect}
      />
    );
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <button className="brand brand-button" onClick={goHome} aria-label={t.home}>
          <span className="brand-mark">E</span>
          <span>ENDGEGNER</span>
        </button>
        <div className="topbar-controls">
          <button className="back-home" onClick={goHome}><span>←</span>{t.home}</button>
          <button className="stats-trigger" onClick={openStats}>
            <span className="stats-trigger-icon" aria-hidden="true"><i /><i /><i /></span>
            <span className="stats-trigger-label">{t.stats}</span>
          </button>
          <div className="segmented compact" aria-label="Interface language">
            {(["ru", "en"] as Language[]).map((item) => (
              <button key={item} className={language === item ? "active" : ""} onClick={() => setLanguage(item)}>
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="lifetime" title={t.lifetime}>
            <span className="spark">✦</span> {lifetimeCorrect}
          </div>
        </div>
      </header>

      <section className="trainer-wrap">
        <div className="intro-line">
          <p>{t.tagline}</p>
        </div>

        {!finished ? (
          <article className={`trainer-card ${result ? `has-${result}` : ""}`}>
            <div className="card-topline">
              <div className="run-label">{t.run} <strong>{String(index + 1).padStart(2, "0")}/{SESSION_LENGTH}</strong></div>
              <div className="run-stats">
                <span>{t.streak} <strong>×{streak}</strong></span>
              </div>
            </div>

            <div className="run-progress" aria-label={`${index + 1} of ${SESSION_LENGTH}`}>
              <span style={{ width: `${((index + (result ? 1 : 0)) / SESSION_LENGTH) * 100}%` }} />
            </div>

            <div className="mode-row">
              <div className="segmented mode-switch">
                <button disabled={Boolean(result)} className={mode === "word" ? "active" : ""} onClick={() => switchMode("word")}>{t.wordMode}</button>
                <button disabled={Boolean(result)} className={mode === "ending" ? "active" : ""} onClick={() => switchMode("ending")}>{t.endingMode}</button>
              </div>
              <p>{t.mixedNote}</p>
            </div>

            <div className="exercise">
              <div className="lemma-label">
                <span>{t.adjective}</span>
                <strong>{question.lemma}</strong>
              </div>

              <div className="sentence" aria-live="polite">
                <span>{question.before}</span>
                {result ? (
                  <strong className="revealed-answer">{answerForSentence}</strong>
                ) : mode === "word" ? (
                  <span className="sentence-gap" aria-hidden="true">••••••</span>
                ) : (
                  <strong className="stem-preview">
                    {question.before.length === 0 ? question.lemma.charAt(0).toUpperCase() + question.lemma.slice(1) : question.lemma}
                    <i>{selectedEnding ?? "__"}</i>
                  </strong>
                )}
                <span>{question.after}</span>
              </div>

              {!result && mode === "word" && (
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

              {!result && mode === "ending" && (
                <div className="ending-panel">
                  <p>{t.choose}</p>
                  <div className="ending-grid">
                    {ENDINGS.map((ending) => (
                      <button key={ending} className={selectedEnding === ending ? "selected" : ""} onClick={() => setSelectedEnding(ending)}>
                        <span>-{ending}</span><kbd>{ENDINGS.indexOf(ending) + 1}</kbd>
                      </button>
                    ))}
                  </div>
                  <button ref={endingSubmitRef} className="primary-button wide" onClick={() => submit()} disabled={!selectedEnding}>{t.check}<span>↗</span></button>
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
                    <span>{t[question.caseKey]}</span>
                    <span>{t[question.gender]}</span>
                    <span>{t[question.article]}</span>
                  </div>
                  <p className="rule"><b>{question.clue}</b> — {ruleText(question)}</p>
                  {result === "wrong" && (
                    <p className="submitted-answer">{t.yourAnswer}: <s>{mode === "word" ? value : `-${selectedEnding}`}</s></p>
                  )}
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
        <span>ADJEKTIV-ENDUNGEN / 01</span>
        <span>LEARN THE SIGNAL, NOT THE TABLE.</span>
      </footer>

      {statsOpen && (
        <div
          className="stats-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setStatsOpen(false);
          }}
        >
          <aside className="stats-drawer" role="dialog" aria-modal="true" aria-labelledby="stats-title">
            <div className="stats-drawer-header">
              <div>
                <p>ADJEKTIV-ENDUNGEN / STATS</p>
                <h2 id="stats-title">{t.statsTitle}</h2>
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
                <div className="stats-overview">
                  <div>
                    <span>{t.totalAnswers}</span>
                    <strong>{statsOverview.total}</strong>
                  </div>
                  <div className="stats-overview-accent">
                    <span>{t.accuracy}</span>
                    <strong>{Math.round((statsOverview.correct / statsOverview.total) * 100)}%</strong>
                  </div>
                  <div>
                    <span>{t.totalMistakes}</span>
                    <strong>{statsOverview.mistakes}</strong>
                  </div>
                </div>

                <section className="stats-articles" aria-labelledby="stats-article-title">
                  <div className="stats-section-title">
                    <h3 id="stats-article-title">{t.articleType}</h3>
                    <span>01 — 04</span>
                  </div>
                  <div className="stats-article-tabs" role="tablist" aria-label={t.articleType}>
                    {ARTICLES.map((article) => {
                      const articleStats = statsOverview.byArticle[article];
                      const percentage = articleStats.total
                        ? Math.round((articleStats.correct / articleStats.total) * 100)
                        : 0;
                      return (
                        <button
                          key={article}
                          type="button"
                          role="tab"
                          aria-selected={activeStatsArticle === article}
                          className={`stats-article-tab ${activeStatsArticle === article ? "active" : ""}`}
                          onClick={() => setActiveStatsArticle(article)}
                        >
                          <span className="stats-article-name">
                            <b>{ARTICLE_MARKS[article]}</b>
                            <span>{t[article]}</span>
                          </span>
                          <span className="stats-article-metric">
                            <strong>{articleStats.total ? `${percentage}%` : "—"}</strong>
                            <small>{articleStats.total} {t.answersShort}</small>
                          </span>
                          <i className="stats-article-bar"><i style={{ width: `${percentage}%` }} /></i>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="stats-breakdown" role="tabpanel">
                  <div className="stats-breakdown-heading">
                    <div>
                      <h3>{t.statsBreakdown}</h3>
                      <p><b>{ARTICLE_MARKS[activeStatsArticle]}</b> {t[activeStatsArticle]}</p>
                    </div>
                    <div className="stats-legend">
                      <span><i className="correct-dot" />{t.totalCorrect}</span>
                      <span><i className="mistake-dot" />{t.totalMistakes}</span>
                    </div>
                  </div>

                  <div className="stats-table-wrap">
                    <table className="stats-table">
                      <thead>
                        <tr>
                          <th aria-label="Case" />
                          {GENDERS.map((gender) => <th key={gender}>{t[gender]}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {CASES.map((caseKey) => (
                          <tr key={caseKey}>
                            <th>{t[caseKey]}</th>
                            {GENDERS.map((gender) => {
                              const cell = stats[`${caseKey}-${gender}-${activeStatsArticle}`] ?? { correct: 0, total: 0 };
                              const mistakes = cell.total - cell.correct;
                              const percentage = cell.total ? Math.round((cell.correct / cell.total) * 100) : 0;
                              return (
                                <td key={gender}>
                                  <div className={`stats-cell ${cell.total === 0 ? "is-empty" : ""}`}>
                                    <strong>{cell.total ? `${percentage}%` : "—"}</strong>
                                    {cell.total > 0 && (
                                      <>
                                        <div className="stats-counts">
                                          <span className="correct-count">✓ {cell.correct}</span>
                                          <span className="mistake-count">× {mistakes}</span>
                                        </div>
                                        <div className="stats-meter"><i style={{ width: `${percentage}%` }} /></div>
                                      </>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            <p className="stats-note">✦ {t.statsNote}</p>
          </aside>
        </div>
      )}
    </main>
  );
}
