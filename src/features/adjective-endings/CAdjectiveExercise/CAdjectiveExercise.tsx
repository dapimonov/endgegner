import { APP_COPY } from "../../../application/app.copy";
import {
  EAdjectiveAnswerMode,
  EAnswerResult,
  ELanguage,
} from "../../../shared/model";
import { CFeedbackPanel } from "../../../shared/trainer/CFeedbackPanel/CFeedbackPanel";
import { CPrimaryButton } from "../../../shared/trainer/CPrimaryButton/CPrimaryButton";
import {
  CModeSwitch,
  CTextAnswer,
  CTrainerCard,
  CTrainerExercise,
  trainerCardStyles,
} from "../../../shared/trainer/CTrainerCard/CTrainerCard";
import {
  ADJECTIVE_ENDINGS,
  ADJECTIVE_SESSION_LENGTH,
} from "../adjective.model";
import { useAdjectiveTrainer } from "../useAdjectiveTrainer";

import styles from "./CAdjectiveExercise.module.css";

export interface IAdjectiveExerciseProps {
  copy: (typeof APP_COPY)[ELanguage.Russian];
  trainer: ReturnType<typeof useAdjectiveTrainer>;
  ruleText: string;
}

export function CAdjectiveExercise({
  copy,
  trainer,
  ruleText,
}: IAdjectiveExerciseProps) {
  const question = trainer.question;
  if (!question) return null;

  const sentence = (
    <>
      <span>{question.before}</span>
      {trainer.result ? (
        <strong className={trainerCardStyles.revealedAnswer}>
          {trainer.answerForSentence}
        </strong>
      ) : trainer.mode === EAdjectiveAnswerMode.Word ? (
        <span className={trainerCardStyles.sentenceGap} aria-hidden="true">
          ••••••
        </span>
      ) : (
        <strong className={trainerCardStyles.stemPreview}>
          {question.before.length === 0
            ? question.lemma.charAt(0).toUpperCase() + question.lemma.slice(1)
            : question.lemma}
          <i>{trainer.selectedEnding ?? "__"}</i>
        </strong>
      )}
      <span>{question.after}</span>
    </>
  );

  return (
    <CTrainerCard
      runLabel={copy.run}
      position={trainer.index + 1}
      total={ADJECTIVE_SESSION_LENGTH}
      streakLabel={copy.streak}
      streak={trainer.streak}
      result={trainer.result}
      modeControls={
        <CModeSwitch
          firstLabel={copy.wordMode}
          secondLabel={copy.endingMode}
          firstActive={trainer.mode === EAdjectiveAnswerMode.Word}
          disabled={Boolean(trainer.result)}
          onFirst={() => trainer.switchMode(EAdjectiveAnswerMode.Word)}
          onSecond={() => trainer.switchMode(EAdjectiveAnswerMode.Ending)}
        />
      }
      mixedNote={copy.mixedNote}
    >
      <CTrainerExercise
        lemmaLabel={copy.adjective}
        lemma={question.lemma}
        sentence={sentence}
      >
        {!trainer.result && trainer.mode === EAdjectiveAnswerMode.Word && (
          <CTextAnswer
            value={trainer.value}
            onChange={trainer.setValue}
            onSubmit={trainer.submit}
            placeholder={copy.placeholder}
            checkLabel={copy.check}
            focusKey={trainer.index}
          />
        )}

        {!trainer.result && trainer.mode === EAdjectiveAnswerMode.Ending && (
          <div className={styles.panel}>
            <p>{copy.choose}</p>
            <div className={styles.grid}>
              {ADJECTIVE_ENDINGS.map((ending, endingIndex) => (
                <button
                  key={ending}
                  className={
                    trainer.selectedEnding === ending ? styles.selected : undefined
                  }
                  onClick={() => trainer.setSelectedEnding(ending)}
                >
                  <span>-{ending}</span>
                  <kbd>{endingIndex + 1}</kbd>
                </button>
              ))}
            </div>
            <CPrimaryButton
              id="adjective-ending-submit"
              wide
              onClick={() => trainer.submit()}
              disabled={!trainer.selectedEnding}
            >
              {copy.check}
              <span>↗</span>
            </CPrimaryButton>
          </div>
        )}

        {trainer.result && (
          <CFeedbackPanel
            result={trainer.result}
            heading={
              trainer.result === EAnswerResult.Correct
                ? copy.correct
                : copy.wrong
            }
            sentence={trainer.fullSentence}
            tags={
              <>
                <span>{copy[question.caseKey]}</span>
                <span>{copy[question.gender]}</span>
                <span>{copy[question.article]}</span>
              </>
            }
            rule={
              <>
                <b>{question.clue}</b> — {ruleText}
              </>
            }
            submittedAnswer={
              trainer.result === EAnswerResult.Wrong ? (
                <>
                  {copy.yourAnswer}:{" "}
                  <s>
                    {trainer.mode === EAdjectiveAnswerMode.Word
                      ? trainer.value
                      : `-${trainer.selectedEnding}`}
                  </s>
                </>
              ) : undefined
            }
            nextLabel={
              trainer.index === trainer.questions.length - 1
                ? copy.finish
                : copy.next
            }
            onNext={trainer.goNext}
          />
        )}
      </CTrainerExercise>
    </CTrainerCard>
  );
}
