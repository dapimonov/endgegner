import {
  APP_COPY,
  REVIEW_COPY,
} from "../../../application/app.copy";
import {
  EAdjectiveAnswerMode,
  EAnswerResult,
  ELanguage,
  EMistakeReviewStep,
  ETrainerRunKind,
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
import { ADJECTIVE_ENDINGS } from "../adjective.model";
import { useAdjectiveTrainer } from "../useAdjectiveTrainer";

import styles from "./CAdjectiveExercise.module.css";

export interface IAdjectiveExerciseProps {
  copy: (typeof APP_COPY)[ELanguage.Russian];
  reviewCopy: (typeof REVIEW_COPY)[ELanguage.Russian];
  trainer: ReturnType<typeof useAdjectiveTrainer>;
  ruleText: string;
}

export function CAdjectiveExercise({
  copy,
  reviewCopy,
  trainer,
  ruleText,
}: IAdjectiveExerciseProps) {
  const question = trainer.question;
  if (!question) return null;
  const isReview = trainer.runKind === ETrainerRunKind.Mistakes;
  const reviewStatus = !isReview
    ? trainer.result === EAnswerResult.Wrong
      ? reviewCopy.added
      : undefined
    : trainer.reviewItem?.step === EMistakeReviewStep.Source
      ? trainer.result === EAnswerResult.Correct
        ? reviewCopy.sourceCorrect
        : reviewCopy.sourceWrong
      : trainer.result === EAnswerResult.Correct
        ? reviewCopy.analogueCorrect
        : reviewCopy.analogueWrong;

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
      runLabel={isReview ? reviewCopy.runLabel : copy.run}
      position={trainer.index + 1}
      total={trainer.questions.length}
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
      mixedNote={
        isReview
          ? trainer.reviewItem?.step === EMistakeReviewStep.Source
            ? reviewCopy.sourceStep
            : reviewCopy.analogueStep
          : copy.mixedNote
      }
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
            focusKey={trainer.index + (isReview ? 1000 : 0)}
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
            statusMessage={reviewStatus}
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
