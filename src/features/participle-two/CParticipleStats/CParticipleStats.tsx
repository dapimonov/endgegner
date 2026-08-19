import { useMemo, useState } from "react";

import { PARTICIPLE_COPY } from "../../../application/app.copy";
import { ELanguage } from "../../../shared/model";
import {
  CStatsDrawer,
  CStatsOverview,
} from "../../../shared/stats/CStatsDrawer/CStatsDrawer";
import {
  EParticipleFormation,
  EParticiplePattern,
  type IParticipleVerb,
} from "../participle.model";
import {
  type IParticipleGroupStats,
  useParticipleTrainer,
} from "../useParticipleTrainer";

import styles from "./CParticipleStats.module.css";

export interface IParticipleStatsProps {
  copy: (typeof PARTICIPLE_COPY)[ELanguage.Russian];
  trainer: ReturnType<typeof useParticipleTrainer>;
}

interface IGroupCopy {
  label: string;
  example: string;
}

function groupCopy(
  copy: IParticipleStatsProps["copy"],
  group: IParticipleGroupStats,
): IGroupCopy {
  switch (group.key) {
    case "weak":
      return { label: copy.weak, example: copy.weakExample };
    case "strong":
      return { label: copy.strong, example: copy.strongExample };
    case "mixed":
      return { label: copy.mixed, example: copy.mixedExample };
    case "separable":
      return { label: copy.separable, example: copy.separableExample };
    case "inseparable":
      return { label: copy.inseparable, example: copy.inseparableExample };
    default:
      return { label: copy.ieren, example: copy.ierenExample };
  }
}

function verbTags(
  copy: IParticipleStatsProps["copy"],
  verb: IParticipleVerb,
) {
  const tags = [
    verb.formation === EParticipleFormation.Weak
      ? copy.weakTag
      : verb.formation === EParticipleFormation.Strong
        ? copy.strongTag
        : copy.mixedTag,
  ];
  if (verb.pattern === EParticiplePattern.Separable) {
    tags.push(copy.separableTag);
  } else if (verb.pattern === EParticiplePattern.Inseparable) {
    tags.push(copy.inseparableTag);
  } else if (verb.pattern === EParticiplePattern.Ieren) {
    tags.push(copy.ierenTag);
  }
  return tags.join(" · ");
}

export function CParticipleStats({
  copy,
  trainer,
}: IParticipleStatsProps) {
  const [query, setQuery] = useState("");
  const overview = trainer.statsOverview;
  const filteredVerbs = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("de");
    if (!normalized) return trainer.orderedVerbs;
    return trainer.orderedVerbs.filter(
      (verb) =>
        verb.infinitive.toLocaleLowerCase("de").includes(normalized) ||
        verb.participle.toLocaleLowerCase("de").includes(normalized),
    );
  }, [query, trainer.orderedVerbs]);

  return (
    <CStatsDrawer
      eyebrow="PARTIZIP II / STATS"
      titleId="participle-stats-title"
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
          {
            label: copy.verbsSeen,
            value: (
              <>
                {overview.practiced}
                <small>/200</small>
              </>
            ),
          },
          {
            label: copy.mastered,
            value: overview.mastered,
          },
        ]}
      />

      <section className={styles.groups} aria-labelledby="participle-groups">
        <div className={styles.sectionTitle}>
          <h3 id="participle-groups">{copy.groups}</h3>
          <span>{overview.needsWork} ↻ {copy.needsWork}</span>
        </div>
        <div className={styles.groupGrid}>
          {trainer.groupStats.map((group) => {
            const labels = groupCopy(copy, group);
            const percentage = group.total
              ? Math.round((group.correct / group.total) * 100)
              : 0;
            return (
              <article key={group.key} className={styles.groupCard}>
                <div>
                  <strong>{labels.label}</strong>
                  <span>{labels.example}</span>
                </div>
                <div className={styles.groupMetric}>
                  <strong>{group.total ? `${percentage}%` : "—"}</strong>
                  <span>{group.verbs}</span>
                </div>
                <i>
                  <i style={{ width: `${percentage}%` }} />
                </i>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.verbs} aria-labelledby="participle-verbs">
        <div className={styles.sectionTitle}>
          <h3 id="participle-verbs">{copy.verbs}</h3>
          <span>{filteredVerbs.length} / 200</span>
        </div>
        <label className={styles.search}>
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.search}
            aria-label={copy.search}
          />
        </label>
        <div className={styles.list}>
          {filteredVerbs.map((verb) => {
            const item = trainer.stats[verb.id] ?? {
              correct: 0,
              total: 0,
              recent: [],
            };
            const percentage = item.total
              ? Math.round((item.correct / item.total) * 100)
              : 0;
            const recent: (boolean | null)[] = [...item.recent.slice(-3)];
            while (recent.length < 3) recent.unshift(null);

            return (
              <article
                key={verb.id}
                className={`${styles.row} ${item.total ? "" : styles.emptyRow}`}
              >
                <div className={styles.verbName}>
                  <strong>{verb.infinitive}</strong>
                  <span>→ {verb.participle}</span>
                  <small>{verbTags(copy, verb)}</small>
                </div>
                <div className={styles.recent} aria-label={copy.recent}>
                  {recent.map((answer, recentIndex) => (
                    <i
                      key={`${verb.id}-${recentIndex}`}
                      data-result={
                        answer === null
                          ? "empty"
                          : answer
                            ? "correct"
                            : "wrong"
                      }
                    />
                  ))}
                </div>
                <div className={styles.metric}>
                  <strong>{item.total ? `${percentage}%` : "—"}</strong>
                  <span>
                    {item.correct}/{item.total} {copy.correctShort}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </CStatsDrawer>
  );
}
