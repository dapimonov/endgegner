import type { ReactNode } from "react";

import { EAnswerResult } from "../../model";
import { CPrimaryButton } from "../CPrimaryButton/CPrimaryButton";

import styles from "./CFeedbackPanel.module.css";

export interface IFeedbackPanelProps {
  result: EAnswerResult;
  heading: string;
  sentence: string;
  tags: ReactNode;
  rule: ReactNode;
  submittedAnswer?: ReactNode;
  nextLabel: string;
  onNext: () => void;
}

export function CFeedbackPanel({
  result,
  heading,
  sentence,
  tags,
  rule,
  submittedAnswer,
  nextLabel,
  onNext,
}: IFeedbackPanelProps) {
  return (
    <div className={`${styles.feedback} ${styles[result]}`}>
      <div className={styles.heading}>
        <span className={styles.icon}>
          {result === EAnswerResult.Correct ? "✓" : "↗"}
        </span>
        <div>
          <h2>{heading}</h2>
          <p>{sentence}</p>
        </div>
      </div>
      <div className={styles.tags}>{tags}</div>
      <p className={styles.rule}>{rule}</p>
      {submittedAnswer && (
        <p className={styles.submitted}>{submittedAnswer}</p>
      )}
      <CPrimaryButton className={styles.next} onClick={onNext}>
        {nextLabel}
        <span>→</span>
      </CPrimaryButton>
    </div>
  );
}
