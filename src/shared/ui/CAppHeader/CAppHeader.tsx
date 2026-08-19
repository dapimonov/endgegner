import { ELanguage } from "../../model";
import { CLanguageSwitch } from "../CLanguageSwitch/CLanguageSwitch";

import styles from "./CAppHeader.module.css";

export interface IAppHeaderProps {
  language: ELanguage;
  onLanguageChange: (language: ELanguage) => void;
  lifetimeCorrect: number;
  lifetimeLabel: string;
  onHome?: () => void;
  homeLabel?: string;
  onStats?: () => void;
  statsLabel?: string;
  onMistakes?: () => void;
  mistakesLabel?: string;
  mistakesCount?: number;
}

export function CAppHeader({
  language,
  onLanguageChange,
  lifetimeCorrect,
  lifetimeLabel,
  onHome,
  homeLabel,
  onStats,
  statsLabel,
  onMistakes,
  mistakesLabel,
  mistakesCount = 0,
}: IAppHeaderProps) {
  const brandContent = (
    <>
      <span className={styles.brandMark}>E</span>
      <span>ENDGEGNER</span>
    </>
  );

  return (
    <header className={styles.header}>
      {onHome ? (
        <button
          className={`${styles.brand} ${styles.brandButton}`}
          onClick={onHome}
          aria-label={homeLabel}
        >
          {brandContent}
        </button>
      ) : (
        <div className={styles.brand} aria-label="Endgegner home">
          {brandContent}
        </div>
      )}

      <div className={styles.controls}>
        {onHome && (
          <button className={styles.backHome} onClick={onHome}>
            <span>←</span>
            {homeLabel}
          </button>
        )}
        {onStats && (
          <button className={styles.statsTrigger} onClick={onStats}>
            <span className={styles.statsIcon} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className={styles.statsLabel}>{statsLabel}</span>
          </button>
        )}
        {onMistakes && (
          <button className={styles.mistakesTrigger} onClick={onMistakes}>
            <span className={styles.mistakesIcon} aria-hidden="true">↻</span>
            <span className={styles.mistakesLabel}>{mistakesLabel}</span>
            <strong>{mistakesCount}</strong>
          </button>
        )}
        <CLanguageSwitch language={language} onChange={onLanguageChange} />
        <div className={styles.lifetime} title={lifetimeLabel}>
          <span className={styles.spark}>✦</span> {lifetimeCorrect}
        </div>
      </div>
    </header>
  );
}
