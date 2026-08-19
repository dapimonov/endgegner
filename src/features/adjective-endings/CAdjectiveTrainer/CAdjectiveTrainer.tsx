import type { IQuestion } from "../data/questions";
import {
  APP_COPY,
  REVIEW_COPY,
} from "../../../application/app.copy";
import {
  EAdjectiveAnswerMode,
  ELanguage,
  ETrainerRunKind,
} from "../../../shared/model";
import { CReviewDrawer } from "../../../shared/review/CReviewDrawer/CReviewDrawer";
import { CRunResult } from "../../../shared/trainer/CRunResult/CRunResult";
import { CTrainerSection } from "../../../shared/trainer/CTrainerCard/CTrainerCard";
import { CAppFooter } from "../../../shared/ui/CAppFooter/CAppFooter";
import { CAppHeader } from "../../../shared/ui/CAppHeader/CAppHeader";
import { CAppShell } from "../../../shared/ui/CAppShell/CAppShell";
import { CAdjectiveExercise } from "../CAdjectiveExercise/CAdjectiveExercise";
import { CAdjectiveStats } from "../CAdjectiveStats/CAdjectiveStats";
import { ADJECTIVE_SESSION_LENGTH } from "../adjective.model";
import { useAdjectiveTrainer } from "../useAdjectiveTrainer";

export interface IAdjectiveTrainerProps {
  language: ELanguage;
  onLanguageChange: (language: ELanguage) => void;
  mode: EAdjectiveAnswerMode;
  onModeChange: (mode: EAdjectiveAnswerMode) => void;
  lifetimeCorrect: number;
  onCorrect: () => void;
  onHome: () => void;
}

export function CAdjectiveTrainer({
  language,
  onLanguageChange,
  mode,
  onModeChange,
  lifetimeCorrect,
  onCorrect,
  onHome,
}: IAdjectiveTrainerProps) {
  const copy = APP_COPY[language];
  const reviewCopy = REVIEW_COPY[language];
  const trainer = useAdjectiveTrainer({
    mode,
    setMode: onModeChange,
    onCorrect,
  });

  function goHome() {
    trainer.statsDrawer.close();
    trainer.reviewDrawer.close();
    onHome();
  }

  const isReview = trainer.runKind === ETrainerRunKind.Mistakes;

  function ruleText(question: IQuestion) {
    if (question.article === "definite") {
      return copy.ruleDefinite(question.ending);
    }
    if (question.article === "ein") return copy.ruleEin(question.ending);
    if (question.article === "quantity") {
      return copy.ruleQuantity(question.ending);
    }
    return copy.ruleZero(question.ending);
  }

  let weakSpot: string | null = null;
  if (trainer.weakSpotKey) {
    const [caseKey, gender, article] = trainer.weakSpotKey.split("-") as [
      IQuestion["caseKey"],
      IQuestion["gender"],
      IQuestion["article"],
    ];
    weakSpot = `${copy[caseKey]} · ${copy[gender]} · ${copy[article]}`;
  }

  return (
    <CAppShell>
      <CAppHeader
        language={language}
        onLanguageChange={onLanguageChange}
        lifetimeCorrect={lifetimeCorrect}
        lifetimeLabel={copy.lifetime}
        onHome={goHome}
        homeLabel={copy.home}
        onStats={trainer.openStats}
        statsLabel={copy.stats}
        onMistakes={trainer.openReview}
        mistakesLabel={reviewCopy.trigger}
        mistakesCount={trainer.reviewState.active.length}
      />

      {trainer.question && (
        <CTrainerSection tagline={copy.tagline}>
          {trainer.finished ? (
            isReview ? (
              <CRunResult
                correctCount={trainer.correctCount}
                total={trainer.questions.length}
                title={reviewCopy.resultTitle}
                subtitle={reviewCopy.resultSubtitle}
                accuracyLabel={copy.accuracy}
                secondMetricValue={trainer.masteredThisRun}
                secondMetricLabel={reviewCopy.masteredThisRun}
                weakSpotLabel={copy.weakSpot}
                weakSpot={null}
                againLabel={
                  trainer.reviewState.active.length
                    ? reviewCopy.continue
                    : reviewCopy.backToRegular
                }
                onAgain={trainer.startAgain}
                secondaryLabel={
                  trainer.reviewState.active.length
                    ? reviewCopy.backToRegular
                    : undefined
                }
                onSecondary={
                  trainer.reviewState.active.length
                    ? trainer.startRegularRun
                    : undefined
                }
              />
            ) : (
              <CRunResult
                correctCount={trainer.correctCount}
                total={ADJECTIVE_SESSION_LENGTH}
                title={copy.resultTitle}
                subtitle={copy.resultSubtitle}
                accuracyLabel={copy.accuracy}
                bestStreak={trainer.bestStreak}
                bestStreakLabel={copy.bestStreak}
                weakSpotLabel={copy.weakSpot}
                weakSpot={weakSpot}
                againLabel={copy.again}
                onAgain={trainer.startAgain}
              />
            )
          ) : (
            <CAdjectiveExercise
              copy={copy}
              reviewCopy={reviewCopy}
              trainer={trainer}
              ruleText={ruleText(trainer.question)}
            />
          )}
        </CTrainerSection>
      )}

      <CAppFooter
        primary="ADJEKTIV-ENDUNGEN / 01"
        secondary="LEARN THE SIGNAL, NOT THE TABLE."
      />

      {trainer.statsDrawer.isOpen && (
        <CAdjectiveStats copy={copy} trainer={trainer} />
      )}

      {trainer.reviewDrawer.isOpen && (
        <CReviewDrawer
          titleId="adjective-review-title"
          eyebrow={reviewCopy.eyebrow}
          title={reviewCopy.title}
          subtitle={reviewCopy.subtitle}
          activeLabel={reviewCopy.active}
          activeCount={trainer.reviewState.active.length}
          masteredLabel={reviewCopy.mastered}
          masteredCount={trainer.reviewState.masteredIds.length}
          sourceStepTitle={reviewCopy.sourceStepTitle}
          sourceStepText={reviewCopy.sourceStepText}
          analogueStepTitle={reviewCopy.analogueStepTitle}
          analogueStepText={reviewCopy.analogueStepText}
          startLabel={reviewCopy.start}
          emptyTitle={reviewCopy.emptyTitle}
          emptyHint={reviewCopy.emptyHint}
          closeLabel={reviewCopy.close}
          note={reviewCopy.note}
          onStart={trainer.startReview}
          onClose={trainer.reviewDrawer.close}
        />
      )}
    </CAppShell>
  );
}
