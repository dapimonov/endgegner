import { ELanguage } from "../../model";

import styles from "./CLanguageSwitch.module.css";

export interface ILanguageSwitchProps {
  language: ELanguage;
  onChange: (language: ELanguage) => void;
}

export function CLanguageSwitch({
  language,
  onChange,
}: ILanguageSwitchProps) {
  return (
    <div className={styles.switcher} aria-label="Interface language">
      {Object.values(ELanguage).map((item) => (
        <button
          key={item}
          className={language === item ? styles.active : undefined}
          onClick={() => onChange(item)}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
