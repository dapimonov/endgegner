import {
  PARTICIPLE_COPY,
  REVIEW_COPY,
} from "../../../application/app.copy";
import { ELanguage, ETrainerRunKind } from "../../../shared/model";
import { CReviewDrawer } from "../../../shared/review/CReviewDrawer/CReviewDrawer";
import { CRunResult } from "../../../shared/trainer/CRunResult/CRunResult";
import { CTrainerSection } from "../../../shared/trainer/CTrainerCard/CTrainerCard";
import { CAppFooter } from "../../../shared/ui/CAppFooter/CAppFooter";
import { CAppHeader } from "../../../shared/ui/CAppHeader/CAppHeader";
import { CAppShell } from "../../../shared/ui/CAppShell/CAppShell";
import { CParticipleExercise } from "../CParticipleExercise/CParticipleExercise";
import { CParticipleStats } from "../CParticipleStats/CParticipleStats";
import { PARTICIPLE_SESSION_LENGTH } from "../participle.model";
import { useParticipleTrainer } from "../useParticipleTrainer";

export interface IParticipleTrainerProps {
  language: ELanguage;
  onLanguageChange: (language: ELanguage) => void;
  lifetimeCorrect: number;
  onCorrect: () => void;
  onHome: () => void;
}

export function CParticipleTrainer({
  language,
  onLanguageChange,
  lifetimeCorrect,
  onCorrect,
  onHome,
}: IParticipleTrainerProps) {
  const copy = PARTICIPLE_COPY[language];
  const reviewCopy = REVIEW_COPY[language];
  const trainer = useParticipleTrainer({ onCorrect });
  const isReview = trainer.runKind === ETrainerRunKind.Mistakes;

  function goHome() {
    trainer.statsDrawer.close();
    trainer.reviewDrawer.close();
    onHome();
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
                total={PARTICIPLE_SESSION_LENGTH}
                title={copy.resultTitle}
                subtitle={copy.resultSubtitle}
                accuracyLabel={copy.accuracy}
                bestStreak={trainer.bestStreak}
                bestStreakLabel={copy.bestStreak}
                weakSpotLabel={copy.weakSpot}
                weakSpot={trainer.weakSpot}
                againLabel={copy.again}
                onAgain={trainer.startAgain}
              />
            )
          ) : (
            <CParticipleExercise
              copy={copy}
              reviewCopy={reviewCopy}
              trainer={trainer}
            />
          )}
        </CTrainerSection>
      )}

      <CAppFooter
        primary="PARTIZIP II / 03"
        secondary="THREE CONTEXTS. ONE FORM."
      />

      {trainer.statsDrawer.isOpen && (
        <CParticipleStats copy={copy} trainer={trainer} />
      )}

      {trainer.reviewDrawer.isOpen && (
        <CReviewDrawer
          titleId="participle-review-title"
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
