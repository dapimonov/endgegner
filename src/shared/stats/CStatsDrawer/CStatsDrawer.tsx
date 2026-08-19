import type { ReactNode } from "react";

import styles from "./CStatsDrawer.module.css";

export interface IStatsDrawerProps {
  eyebrow: string;
  titleId: string;
  title: string;
  subtitle: string;
  closeLabel: string;
  emptyTitle: string;
  emptyHint: string;
  hasAnswers: boolean;
  note: string;
  onClose: () => void;
  children: ReactNode;
}

export function CStatsDrawer({
  eyebrow,
  titleId,
  title,
  subtitle,
  closeLabel,
  emptyTitle,
  emptyHint,
  hasAnswers,
  note,
  onClose,
  children,
}: IStatsDrawerProps) {
  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.header}>
          <div>
            <p>{eyebrow}</p>
            <h2 id={titleId}>{title}</h2>
            <span>{subtitle}</span>
          </div>
          <button
            className={styles.close}
            onClick={onClose}
            aria-label={closeLabel}
            autoFocus
          >
            ×
          </button>
        </div>

        {hasAnswers ? (
          children
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyMark}>%</div>
            <h3>{emptyTitle}</h3>
            <p>{emptyHint}</p>
          </div>
        )}

        <p className={styles.note}>✦ {note}</p>
      </aside>
    </div>
  );
}

export interface IStatsMetric {
  label: string;
  value: ReactNode;
  accent?: boolean;
}

export interface IStatsOverviewProps {
  metrics: IStatsMetric[];
  fourColumns?: boolean;
}

export function CStatsOverview({
  metrics,
  fourColumns = false,
}: IStatsOverviewProps) {
  return (
    <div
      className={`${styles.overview} ${fourColumns ? styles.fourColumns : ""}`}
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={metric.accent ? styles.accent : undefined}
        >
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}
    </div>
  );
}
