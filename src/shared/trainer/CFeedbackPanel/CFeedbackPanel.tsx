import type { ReactNode } from "react";
import { useEffect } from "react";

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
  statusMessage?: string;
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
  statusMessage,
  nextLabel,
  onNext,
}: IFeedbackPanelProps) {
  useEffect(() => {
    function handleEnter(event: KeyboardEvent) {
      if (
        event.key !== "Enter" ||
        event.repeat ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        document.querySelector('[role="dialog"][aria-modal="true"]')
      ) {
        return;
      }

      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("button, input, textarea, select, a")
      ) {
        return;
      }

      event.preventDefault();
      onNext();
    }

    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [onNext]);

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
      {statusMessage && <p className={styles.status}>{statusMessage}</p>}
      <CPrimaryButton className={styles.next} onClick={onNext}>
        {nextLabel}
        <span>→</span>
      </CPrimaryButton>
    </div>
  );
}
