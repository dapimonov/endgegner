import { VERB_COPY } from "../../../application/app.copy";
import { ELanguage } from "../../../shared/model";
import { CRunResult } from "../../../shared/trainer/CRunResult/CRunResult";
import { CTrainerSection } from "../../../shared/trainer/CTrainerCard/CTrainerCard";
import { CAppFooter } from "../../../shared/ui/CAppFooter/CAppFooter";
import { CAppHeader } from "../../../shared/ui/CAppHeader/CAppHeader";
import { CAppShell } from "../../../shared/ui/CAppShell/CAppShell";
import { CVerbExercise } from "../CVerbExercise/CVerbExercise";
import { CVerbStats } from "../CVerbStats/CVerbStats";
import { useVerbTrainer } from "../useVerbTrainer";
import { VERB_SESSION_LENGTH } from "../verb.model";

export interface IVerbTrainerProps {
  language: ELanguage;
  onLanguageChange: (language: ELanguage) => void;
  lifetimeCorrect: number;
  onCorrect: () => void;
  onHome: () => void;
}

export function CVerbTrainer({
  language,
  onLanguageChange,
  lifetimeCorrect,
  onCorrect,
  onHome,
}: IVerbTrainerProps) {
  const copy = VERB_COPY[language];
  const trainer = useVerbTrainer({ onCorrect });

  function goHome() {
    trainer.statsDrawer.close();
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
        onStats={trainer.statsDrawer.open}
        statsLabel={copy.stats}
      />

      {trainer.question && (
        <CTrainerSection tagline={copy.tagline}>
          {trainer.finished ? (
            <CRunResult
              correctCount={trainer.correctCount}
              total={VERB_SESSION_LENGTH}
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
          ) : (
            <CVerbExercise copy={copy} trainer={trainer} />
          )}
        </CTrainerSection>
      )}

      <CAppFooter
        primary="VERBREKTION / 02"
        secondary="LEARN THE PATTERN, NOT THE LIST."
      />

      {trainer.statsDrawer.isOpen && (
        <CVerbStats copy={copy} trainer={trainer} />
      )}
    </CAppShell>
  );
}
