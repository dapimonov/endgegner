import { APP_COPY } from "../../../application/app.copy";
import { ELanguage } from "../../../shared/model";
import {
  CStatsDrawer,
  CStatsOverview,
} from "../../../shared/stats/CStatsDrawer/CStatsDrawer";
import {
  ADJECTIVE_ARTICLE_MARKS,
  ADJECTIVE_ARTICLES,
  ADJECTIVE_CASES,
  ADJECTIVE_GENDERS,
} from "../adjective.model";
import { useAdjectiveTrainer } from "../useAdjectiveTrainer";

import styles from "./CAdjectiveStats.module.css";

export interface IAdjectiveStatsProps {
  copy: (typeof APP_COPY)[ELanguage.Russian];
  trainer: ReturnType<typeof useAdjectiveTrainer>;
}

export function CAdjectiveStats({
  copy,
  trainer,
}: IAdjectiveStatsProps) {
  const overview = trainer.statsOverview;

  return (
    <CStatsDrawer
      eyebrow="ADJEKTIVENDUNGEN / STATS"
      titleId="adjective-stats-title"
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
        metrics={[
          { label: copy.totalAnswers, value: overview.total },
          {
            label: copy.accuracy,
            value: `${Math.round((overview.correct / overview.total) * 100)}%`,
            accent: true,
          },
          { label: copy.totalMistakes, value: overview.mistakes },
        ]}
      />

      <section className={styles.articles} aria-labelledby="article-type-title">
        <div className={styles.sectionTitle}>
          <h3 id="article-type-title">{copy.articleType}</h3>
          <span>01 — 04</span>
        </div>
        <div className={styles.articleTabs} role="tablist">
          {ADJECTIVE_ARTICLES.map((article) => {
            const articleStats = overview.byArticle[article];
            const percentage = articleStats.total
              ? Math.round((articleStats.correct / articleStats.total) * 100)
              : 0;
            return (
              <button
                key={article}
                type="button"
                role="tab"
                aria-selected={trainer.activeStatsArticle === article}
                className={`${styles.articleTab} ${
                  trainer.activeStatsArticle === article ? styles.active : ""
                }`}
                onClick={() => trainer.setActiveStatsArticle(article)}
              >
                <span className={styles.articleName}>
                  <b>{ADJECTIVE_ARTICLE_MARKS[article]}</b>
                  <span>{copy[article]}</span>
                </span>
                <span className={styles.articleMetric}>
                  <strong>{articleStats.total ? `${percentage}%` : "—"}</strong>
                  <small>
                    {articleStats.total} {copy.answersShort}
                  </small>
                </span>
                <i className={styles.articleBar}>
                  <i style={{ width: `${percentage}%` }} />
                </i>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.breakdown} role="tabpanel">
        <div className={styles.breakdownHeading}>
          <div>
            <h3>{copy.statsBreakdown}</h3>
            <p>
              <b>{ADJECTIVE_ARTICLE_MARKS[trainer.activeStatsArticle]}</b>{" "}
              {copy[trainer.activeStatsArticle]}
            </p>
          </div>
          <div className={styles.legend}>
            <span>
              <i className={styles.correctDot} />
              {copy.totalCorrect}
            </span>
            <span>
              <i className={styles.mistakeDot} />
              {copy.totalMistakes}
            </span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th aria-label="Case" />
                {ADJECTIVE_GENDERS.map((gender) => (
                  <th key={gender}>{copy[gender]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ADJECTIVE_CASES.map((caseKey) => (
                <tr key={caseKey}>
                  <th>{copy[caseKey]}</th>
                  {ADJECTIVE_GENDERS.map((gender) => {
                    const cell = trainer.stats[
                      `${caseKey}-${gender}-${trainer.activeStatsArticle}`
                    ] ?? { correct: 0, total: 0 };
                    const mistakes = cell.total - cell.correct;
                    const percentage = cell.total
                      ? Math.round((cell.correct / cell.total) * 100)
                      : 0;
                    return (
                      <td key={gender}>
                        <div
                          className={`${styles.cell} ${
                            cell.total === 0 ? styles.emptyCell : ""
                          }`}
                        >
                          <strong>{cell.total ? `${percentage}%` : "—"}</strong>
                          {cell.total > 0 && (
                            <>
                              <div className={styles.counts}>
                                <span className={styles.correctCount}>
                                  ✓ {cell.correct}
                                </span>
                                <span className={styles.mistakeCount}>
                                  × {mistakes}
                                </span>
                              </div>
                              <div className={styles.meter}>
                                <i style={{ width: `${percentage}%` }} />
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </CStatsDrawer>
  );
}
