import { VERB_PATTERNS } from "../data/verbQuestions";
import { VERB_COPY } from "../../../application/app.copy";
import { ELanguage } from "../../../shared/model";
import {
  CStatsDrawer,
  CStatsOverview,
} from "../../../shared/stats/CStatsDrawer/CStatsDrawer";
import { useVerbTrainer } from "../useVerbTrainer";

import styles from "./CVerbStats.module.css";

export interface IVerbStatsProps {
  copy: (typeof VERB_COPY)[ELanguage.Russian];
  trainer: ReturnType<typeof useVerbTrainer>;
}

export function CVerbStats({ copy, trainer }: IVerbStatsProps) {
  const overview = trainer.statsOverview;

  return (
    <CStatsDrawer
      eyebrow="VERBREKTION / STATS"
      titleId="verb-stats-title"
      title={copy.statsTitle}
      subtitle={copy.statsSubtitle}
      closeLabel={copy.closeStats}
      emptyTitle={copy.noAnswers}
      emptyHint={copy.noAnswersHint}
      hasAnswers={overview.total > 0}
      note={copy.statsNote}
      onClose={trainer.statsDrawer.close}
    >
      <CStatsOverview
        fourColumns
        metrics={[
          { label: copy.totalAnswers, value: overview.total },
          {
            label: copy.accuracy,
            value: `${Math.round((overview.correct / overview.total) * 100)}%`,
            accent: true,
          },
          { label: copy.totalMistakes, value: overview.mistakes },
          {
            label: copy.patternsSeen,
            value: (
              <>
                {overview.practiced}
                <small>/{VERB_PATTERNS.length}</small>
              </>
            ),
          },
        ]}
      />

      <section className={styles.patternStats} aria-labelledby="patterns-title">
        <div className={styles.sectionTitle}>
          <h3 id="patterns-title">{copy.patterns}</h3>
          <span>
            {String(overview.practiced).padStart(2, "0")} /{" "}
            {VERB_PATTERNS.length}
          </span>
        </div>
        <div className={styles.list}>
          {trainer.orderedPatterns.map((pattern) => {
            const item = trainer.stats[pattern.id] ?? {
              correct: 0,
              total: 0,
              prepositionErrors: 0,
              reflexiveErrors: 0,
            };
            const mistakes = item.total - item.correct;
            const percentage = item.total
              ? Math.round((item.correct / item.total) * 100)
              : 0;
            return (
              <article
                key={pattern.id}
                className={`${styles.row} ${
                  item.total ? "" : styles.emptyRow
                }`}
              >
                <div className={styles.copy}>
                  <strong>{pattern.frame}</strong>
                  <span>
                    {copy[pattern.caseKey]} ·{" "}
                    {pattern.reflexive
                      ? copy.reflexivePattern
                      : copy.plainPattern}
                  </span>
                  {item.total > 0 && (
                    <small>
                      {copy.prepErrors}: {item.prepositionErrors}
                      {pattern.reflexive && (
                        <>
                          {" "}· {copy.reflexiveErrors}: {item.reflexiveErrors}
                        </>
                      )}
                    </small>
                  )}
                </div>
                <div className={styles.metric}>
                  <strong>{item.total ? `${percentage}%` : "—"}</strong>
                  <span>
                    <b>✓ {item.correct}</b>
                    <i>× {mistakes}</i>
                  </span>
                </div>
                <i className={styles.meter}>
                  <i style={{ width: `${percentage}%` }} />
                </i>
              </article>
            );
          })}
        </div>
      </section>
    </CStatsDrawer>
  );
}
