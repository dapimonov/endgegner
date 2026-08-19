import { CPrimaryButton } from "../CPrimaryButton/CPrimaryButton";

import styles from "./CRunResult.module.css";

export interface IRunResultProps {
  correctCount: number;
  total: number;
  title: string;
  subtitle: string;
  accuracyLabel: string;
  bestStreak: number;
  bestStreakLabel: string;
  weakSpotLabel: string;
  weakSpot: string | null;
  againLabel: string;
  onAgain: () => void;
}

export function CRunResult({
  correctCount,
  total,
  title,
  subtitle,
  accuracyLabel,
  bestStreak,
  bestStreakLabel,
  weakSpotLabel,
  weakSpot,
  againLabel,
  onAgain,
}: IRunResultProps) {
  return (
    <article className={styles.card}>
      <div className={styles.burst}>
        {correctCount}
        <small>/{total}</small>
      </div>
      <h1>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      <div className={styles.grid}>
        <div>
          <strong>{Math.round((correctCount / total) * 100)}%</strong>
          <span>{accuracyLabel}</span>
        </div>
        <div>
          <strong>×{bestStreak}</strong>
          <span>{bestStreakLabel}</span>
        </div>
      </div>
      {weakSpot && (
        <div className={styles.weakSpot}>
          <span>{weakSpotLabel}</span>
          <strong>{weakSpot}</strong>
        </div>
      )}
      <CPrimaryButton className={styles.button} onClick={onAgain}>
        {againLabel}
        <span>↻</span>
      </CPrimaryButton>
    </article>
  );
}
