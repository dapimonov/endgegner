import { APP_COPY } from "../../../application/app.copy";
import { ELanguage } from "../../../shared/model";
import { CAppFooter } from "../../../shared/ui/CAppFooter/CAppFooter";
import { CAppHeader } from "../../../shared/ui/CAppHeader/CAppHeader";
import { CAppShell } from "../../../shared/ui/CAppShell/CAppShell";

import styles from "./CArenaScreen.module.css";

export interface IArenaScreenProps {
  language: ELanguage;
  onLanguageChange: (language: ELanguage) => void;
  lifetimeCorrect: number;
  onAdjectiveTrainer: () => void;
  onVerbTrainer: () => void;
  onParticipleTrainer: () => void;
}

export function CArenaScreen({
  language,
  onLanguageChange,
  lifetimeCorrect,
  onAdjectiveTrainer,
  onVerbTrainer,
  onParticipleTrainer,
}: IArenaScreenProps) {
  const copy = APP_COPY[language];

  return (
    <CAppShell>
      <CAppHeader
        language={language}
        onLanguageChange={onLanguageChange}
        lifetimeCorrect={lifetimeCorrect}
        lifetimeLabel={copy.lifetime}
      />

      <section className={styles.main}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>
            <span />
            {copy.homeEyebrow}
          </p>
          <h1>
            {copy.homeTitleStart} <em>{copy.homeTitleAccent}</em>
          </h1>
          <p className={styles.subtitle}>{copy.homeSubtitle}</p>
        </div>

        <div className={styles.sectionHeading}>
          <h2>{copy.trainers}</h2>
          <span>03 / —</span>
        </div>

        <div className={styles.grid}>
          <button className={styles.tile} onClick={onAdjectiveTrainer}>
            <div className={styles.tileCopy}>
              <div className={styles.tileTopline}>
                <span className={styles.tileNumber}>01</span>
                <span className={styles.tileStatus}>
                  <i />
                  {copy.available}
                </span>
              </div>
              <div>
                <p className={styles.tileCategory}>ADJEKTIVENDUNGEN</p>
                <h3>{copy.adjectiveTitle}</h3>
                <p className={styles.tileDescription}>
                  {copy.adjectiveDescription}
                </p>
              </div>
              <div className={styles.tileBottom}>
                <strong>
                  {copy.enterArena} <i>→</i>
                </strong>
              </div>
            </div>
            <div className={styles.tileVisual} aria-hidden="true">
              <span className={styles.tileOrbit} />
              <strong>
                alt<em>__</em>
              </strong>
              <small>-e · -en · -er · -es · -em</small>
            </div>
          </button>

          <button
            className={`${styles.tile} ${styles.verbTile}`}
            onClick={onVerbTrainer}
          >
            <div className={styles.tileCopy}>
              <div className={styles.tileTopline}>
                <span className={styles.tileNumber}>02</span>
                <span className={styles.tileStatus}>
                  <i />
                  {copy.available}
                </span>
              </div>
              <div>
                <p className={styles.tileCategory}>
                  VERBEN MIT PRÄPOSITIONEN
                </p>
                <h3>{copy.verbTitle}</h3>
                <p className={styles.tileDescription}>{copy.verbDescription}</p>
              </div>
              <div className={styles.tileBottom}>
                <strong>
                  {copy.enterArena} <i>→</i>
                </strong>
              </div>
            </div>
            <div className={styles.tileVisual} aria-hidden="true">
              <span className={styles.tileOrbit} />
              <strong>
                <em>sich</em> __
              </strong>
              <small>an · auf · mit · über · um</small>
            </div>
          </button>

          <button
            className={`${styles.tile} ${styles.participleTile}`}
            onClick={onParticipleTrainer}
          >
            <div className={styles.tileCopy}>
              <div className={styles.tileTopline}>
                <span className={styles.tileNumber}>03</span>
                <span className={styles.tileStatus}>
                  <i />
                  {copy.available}
                </span>
              </div>
              <div>
                <p className={styles.tileCategory}>PARTIZIP II</p>
                <h3>{copy.participleTitle}</h3>
                <p className={styles.tileDescription}>
                  {copy.participleDescription}
                </p>
              </div>
              <div className={styles.tileBottom}>
                <strong>
                  {copy.enterArena} <i>→</i>
                </strong>
              </div>
            </div>
            <div className={styles.tileVisual} aria-hidden="true">
              <span className={styles.tileOrbit} />
              <strong>
                ge<em>schrieb</em>en
              </strong>
              <small>gemacht · gesehen · angekommen</small>
            </div>
          </button>
        </div>

        <p className={styles.moreSoon}>↳ {copy.moreSoon}</p>
      </section>

      <CAppFooter primary="ENDGEGNER / ARENA 03" spacious />
    </CAppShell>
  );
}
