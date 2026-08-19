import type {
  FormEvent,
  ReactNode,
} from "react";
import { useEffect, useRef } from "react";

import { EAnswerResult } from "../../model";
import { CPrimaryButton } from "../CPrimaryButton/CPrimaryButton";

import styles from "./CTrainerCard.module.css";

export interface ITrainerSectionProps {
  tagline: string;
  children: ReactNode;
}

export function CTrainerSection({ tagline, children }: ITrainerSectionProps) {
  return (
    <section className={styles.wrap}>
      <div className={styles.introLine}>
        <p>{tagline}</p>
      </div>
      {children}
    </section>
  );
}

export interface ITrainerCardProps {
  runLabel: string;
  position: number;
  total: number;
  streakLabel: string;
  streak: number;
  result: EAnswerResult | null;
  modeControls?: ReactNode;
  mixedNote: string;
  verbAccent?: boolean;
  children: ReactNode;
}

export function CTrainerCard({
  runLabel,
  position,
  total,
  streakLabel,
  streak,
  result,
  modeControls,
  mixedNote,
  verbAccent = false,
  children,
}: ITrainerCardProps) {
  return (
    <article
      className={`${styles.card} ${verbAccent ? styles.verbCard : ""}`}
      data-result={result ?? undefined}
    >
      <div className={styles.topline}>
        <div className={styles.runLabel}>
          {runLabel}{" "}
          <strong>
            {String(position).padStart(2, "0")}/{total}
          </strong>
        </div>
        <div className={styles.runStats}>
          <span>
            {streakLabel} <strong>×{streak}</strong>
          </span>
        </div>
      </div>

      <div className={styles.progress} aria-label={`${position} of ${total}`}>
        <span
          style={{
            width: `${((position - 1 + (result ? 1 : 0)) / total) * 100}%`,
          }}
        />
      </div>

      <div className={styles.modeRow}>
        {modeControls}
        <p>{mixedNote}</p>
      </div>

      <div className={styles.exercise}>{children}</div>
    </article>
  );
}

export interface IModeSwitchProps {
  firstLabel: string;
  secondLabel: string;
  firstActive: boolean;
  disabled: boolean;
  onFirst: () => void;
  onSecond: () => void;
}

export function CModeSwitch({
  firstLabel,
  secondLabel,
  firstActive,
  disabled,
  onFirst,
  onSecond,
}: IModeSwitchProps) {
  return (
    <div className={styles.modeSwitch}>
      <button
        disabled={disabled}
        className={firstActive ? styles.active : undefined}
        onClick={onFirst}
      >
        {firstLabel}
      </button>
      <button
        disabled={disabled}
        className={!firstActive ? styles.active : undefined}
        onClick={onSecond}
      >
        {secondLabel}
      </button>
    </div>
  );
}

export interface ITrainerExerciseProps {
  lemmaLabel: string;
  lemma: string;
  verbAccent?: boolean;
  sentence: ReactNode;
  children: ReactNode;
}

export function CTrainerExercise({
  lemmaLabel,
  lemma,
  verbAccent = false,
  sentence,
  children,
}: ITrainerExerciseProps) {
  return (
    <>
      <div
        className={`${styles.lemmaLabel} ${verbAccent ? styles.verbLemma : ""}`}
      >
        <span>{lemmaLabel}</span>
        <strong>{lemma}</strong>
      </div>
      <div className={styles.sentence} aria-live="polite">
        {sentence}
      </div>
      {children}
    </>
  );
}

export interface ITextAnswerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  placeholder: string;
  checkLabel: string;
  focusKey: number;
}

export function CTextAnswer({
  value,
  onChange,
  onSubmit,
  placeholder,
  checkLabel,
  focusKey,
}: ITextAnswerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [focusKey]);

  return (
    <form className={styles.answerForm} onSubmit={onSubmit}>
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-label={placeholder}
      />
      <CPrimaryButton type="submit" disabled={!value.trim()}>
        {checkLabel}
        <span>↗</span>
      </CPrimaryButton>
    </form>
  );
}

export const trainerCardStyles = styles;
