import { CPrimaryButton } from "../../trainer/CPrimaryButton/CPrimaryButton";

import styles from "./CReviewDrawer.module.css";

export interface IReviewDrawerProps {
  titleId: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  activeLabel: string;
  activeCount: number;
  masteredLabel: string;
  masteredCount: number;
  sourceStepTitle: string;
  sourceStepText: string;
  analogueStepTitle: string;
  analogueStepText: string;
  startLabel: string;
  emptyTitle: string;
  emptyHint: string;
  closeLabel: string;
  note: string;
  onStart: () => void;
  onClose: () => void;
}

export function CReviewDrawer({
  titleId,
  eyebrow,
  title,
  subtitle,
  activeLabel,
  activeCount,
  masteredLabel,
  masteredCount,
  sourceStepTitle,
  sourceStepText,
  analogueStepTitle,
  analogueStepText,
  startLabel,
  emptyTitle,
  emptyHint,
  closeLabel,
  note,
  onStart,
  onClose,
}: IReviewDrawerProps) {
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

        <div className={styles.metrics}>
          <div className={styles.activeMetric}>
            <span>{activeLabel}</span>
            <strong>{activeCount}</strong>
          </div>
          <div>
            <span>{masteredLabel}</span>
            <strong>{masteredCount}</strong>
          </div>
        </div>

        {activeCount ? (
          <>
            <div className={styles.steps}>
              <div>
                <strong>01</strong>
                <h3>{sourceStepTitle}</h3>
                <p>{sourceStepText}</p>
              </div>
              <span aria-hidden="true">→</span>
              <div>
                <strong>02</strong>
                <h3>{analogueStepTitle}</h3>
                <p>{analogueStepText}</p>
              </div>
            </div>
            <CPrimaryButton wide onClick={onStart}>
              {startLabel}
              <span>↗</span>
            </CPrimaryButton>
          </>
        ) : (
          <div className={styles.empty}>
            <div>✓</div>
            <h3>{emptyTitle}</h3>
            <p>{emptyHint}</p>
          </div>
        )}

        <p className={styles.note}>✦ {note}</p>
      </aside>
    </div>
  );
}
