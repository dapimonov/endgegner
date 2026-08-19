import {
  PARTICIPLE_COPY,
  REVIEW_COPY,
} from "../../../application/app.copy";
import {
  EAnswerResult,
  ELanguage,
  EMistakeReviewStep,
  ETrainerRunKind,
} from "../../../shared/model";
import { CFeedbackPanel } from "../../../shared/trainer/CFeedbackPanel/CFeedbackPanel";
import {
  CTextAnswer,
  CTrainerCard,
  CTrainerExercise,
  trainerCardStyles,
} from "../../../shared/trainer/CTrainerCard/CTrainerCard";
import { PARTICIPLE_VERBS_BY_ID } from "../data/participleVerbs";
import {
  EParticipleFormation,
  EParticiplePattern,
  EPerfectAuxiliary,
} from "../participle.model";
import { useParticipleTrainer } from "../useParticipleTrainer";

import styles from "./CParticipleExercise.module.css";

export interface IParticipleExerciseProps {
  copy: (typeof PARTICIPLE_COPY)[ELanguage.Russian];
  reviewCopy: (typeof REVIEW_COPY)[ELanguage.Russian];
  trainer: ReturnType<typeof useParticipleTrainer>;
}

export function CParticipleExercise({
  copy,
  reviewCopy,
  trainer,
}: IParticipleExerciseProps) {
  const question = trainer.question;
  if (!question) return null;
  const verb = PARTICIPLE_VERBS_BY_ID.get(question.verbId);
  if (!verb) return null;

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

  const formationLabel =
    verb.formation === EParticipleFormation.Weak
      ? copy.weakTag
      : verb.formation === EParticipleFormation.Strong
        ? copy.strongTag
        : copy.mixedTag;
  const formationRule =
    verb.formation === EParticipleFormation.Weak
      ? copy.ruleWeak
      : verb.formation === EParticipleFormation.Strong
        ? copy.ruleStrong
        : copy.ruleMixed;
  const patternLabel =
    verb.pattern === EParticiplePattern.Separable
      ? copy.separableTag
      : verb.pattern === EParticiplePattern.Inseparable
        ? copy.inseparableTag
        : verb.pattern === EParticiplePattern.Ieren
          ? copy.ierenTag
          : null;
  const patternRule =
    verb.pattern === EParticiplePattern.Separable
      ? copy.ruleSeparable
      : verb.pattern === EParticiplePattern.Inseparable
        ? copy.ruleInseparable
        : verb.pattern === EParticiplePattern.Ieren
          ? copy.ruleIeren
          : null;

  const sentence = (
    <>
      <span>{question.before}</span>
      {trainer.result ? (
        <strong className={trainerCardStyles.revealedAnswer}>
          {question.answer}
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
        lemmaLabel={copy.infinitive}
        lemma={question.infinitive}
        verbAccent
        sentence={sentence}
      >
        {!trainer.result && (
          <CTextAnswer
            value={trainer.value}
            onChange={trainer.setValue}
            onSubmit={trainer.submit}
            placeholder={copy.placeholder}
            checkLabel={copy.check}
            focusKey={trainer.index + (isReview ? 1000 : 0)}
          />
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
                <span>{question.tense}</span>
                {question.isQuestion && <span>Frage</span>}
                <span>{formationLabel}</span>
                {patternLabel && <span>{patternLabel}</span>}
                <span>
                  {verb.auxiliary === EPerfectAuxiliary.Haben
                    ? copy.habenTag
                    : copy.seinTag}
                </span>
              </>
            }
            rule={
              <>
                <b>
                  {verb.infinitive} <i className={styles.arrow}>→</i>{" "}
                  {verb.participle}
                </b>{" "}
                — {formationRule} {patternRule}
              </>
            }
            submittedAnswer={
              trainer.result === EAnswerResult.Wrong ? (
                <>
                  {copy.yourAnswer}: <s>{trainer.value || "—"}</s>
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
