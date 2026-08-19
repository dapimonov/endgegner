import {
  PREPOSITION_CHOICES,
  REFLEXIVE_CHOICES,
} from "../data/verbQuestions";
import {
  REVIEW_COPY,
  VERB_COPY,
} from "../../../application/app.copy";
import {
  EAnswerResult,
  ELanguage,
  EMistakeReviewStep,
  ETrainerRunKind,
  EVerbAnswerMode,
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
import { useVerbTrainer } from "../useVerbTrainer";
import { bareVerb } from "../verb.model";

import styles from "./CVerbExercise.module.css";

export interface IVerbExerciseProps {
  copy: (typeof VERB_COPY)[ELanguage.Russian];
  reviewCopy: (typeof REVIEW_COPY)[ELanguage.Russian];
  trainer: ReturnType<typeof useVerbTrainer>;
}

export function CVerbExercise({
  copy,
  reviewCopy,
  trainer,
}: IVerbExerciseProps) {
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
          {question.answer}
        </strong>
      ) : trainer.mode === EVerbAnswerMode.Choice && trainer.choiceAnswer ? (
        <strong className={trainerCardStyles.slotPreview}>
          {trainer.choiceAnswer}
        </strong>
      ) : (
        <span className={trainerCardStyles.sentenceGap} aria-hidden="true">
          ••••••
        </span>
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
          firstLabel={copy.typeMode}
          secondLabel={copy.choiceMode}
          firstActive={trainer.mode === EVerbAnswerMode.Type}
          disabled={Boolean(trainer.result)}
          onFirst={() => trainer.switchMode(EVerbAnswerMode.Type)}
          onSecond={() => trainer.switchMode(EVerbAnswerMode.Choice)}
        />
      }
      mixedNote={
        isReview
          ? trainer.reviewItem?.step === EMistakeReviewStep.Source
            ? reviewCopy.sourceStep
            : reviewCopy.analogueStep
          : copy.mixedNote
      }
      verbAccent
    >
      <CTrainerExercise
        lemmaLabel={copy.verb}
        lemma={bareVerb(question.verb)}
        verbAccent
        sentence={sentence}
      >
        {!trainer.result && trainer.mode === EVerbAnswerMode.Type && (
          <CTextAnswer
            value={trainer.value}
            onChange={trainer.setValue}
            onSubmit={trainer.submit}
            placeholder={copy.placeholder}
            checkLabel={copy.check}
            focusKey={trainer.index + (isReview ? 1000 : 0)}
          />
        )}

        {!trainer.result && trainer.mode === EVerbAnswerMode.Choice && (
          <div className={styles.panel}>
            {question.reflexiveAnswer && (
              <div className={styles.group}>
                <p>{copy.chooseReflexive}</p>
                <div className={`${styles.grid} ${styles.reflexiveGrid}`}>
                  {REFLEXIVE_CHOICES.map((item) => (
                    <button
                      key={item}
                      className={
                        trainer.selectedReflexive === item
                          ? styles.selected
                          : undefined
                      }
                      onClick={() => trainer.setSelectedReflexive(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className={styles.group}>
              <p>{copy.choosePreposition}</p>
              <div className={`${styles.grid} ${styles.prepositionGrid}`}>
                {PREPOSITION_CHOICES.map((item) => (
                  <button
                    key={item}
                    className={
                      trainer.selectedPreposition === item
                        ? styles.selected
                        : undefined
                    }
                    onClick={() => trainer.setSelectedPreposition(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <CPrimaryButton
              wide
              onClick={() => trainer.submit()}
              disabled={!trainer.choiceComplete}
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
                <span>{question.frame}</span>
                <span>{copy[question.caseKey]}</span>
                <span>{question.tense}</span>
                {question.isQuestion && <span>Frage</span>}
              </>
            }
            rule={
              <>
                <b>{question.verb}</b> —{" "}
                {question.reflexiveAnswer
                  ? copy.ruleReflexive(question.frame)
                  : copy.rulePlain(question.frame)}
              </>
            }
            submittedAnswer={
              trainer.result === EAnswerResult.Wrong ? (
                <>
                  {copy.yourAnswer}:{" "}
                  <s>{trainer.submittedAnswer || "—"}</s>
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
