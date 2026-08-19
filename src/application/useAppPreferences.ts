import { useEffect, useState } from "react";

import {
  EAdjectiveAnswerMode,
  ELanguage,
} from "../shared/model";

const PREFERENCES_KEY = "endgegner-preferences";
const LIFETIME_KEY = "endgegner-correct";

interface IStoredPreferences {
  language?: string;
  mode?: string;
}

export function useAppPreferences() {
  const [language, setLanguage] = useState(ELanguage.Russian);
  const [adjectiveMode, setAdjectiveMode] = useState(
    EAdjectiveAnswerMode.Word,
  );
  const [lifetimeCorrect, setLifetimeCorrect] = useState(0);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const preferences = JSON.parse(
          localStorage.getItem(PREFERENCES_KEY) ?? "{}",
        ) as IStoredPreferences;
        const savedCorrect = Number(
          localStorage.getItem(LIFETIME_KEY) ?? 0,
        );

        if (
          preferences.language === ELanguage.Russian ||
          preferences.language === ELanguage.English
        ) {
          setLanguage(preferences.language);
        }
        if (
          preferences.mode === EAdjectiveAnswerMode.Word ||
          preferences.mode === EAdjectiveAnswerMode.Ending
        ) {
          setAdjectiveMode(preferences.mode);
        }
        setLifetimeCorrect(savedCorrect);
      } catch {
        // Keep defaults when stored browser data is malformed.
      }
      setRestored(true);
    }, 0);

    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ language, mode: adjectiveMode }),
    );
  }, [adjectiveMode, language, restored]);

  function registerCorrect() {
    setLifetimeCorrect((current) => {
      const next = current + 1;
      localStorage.setItem(LIFETIME_KEY, String(next));
      return next;
    });
  }

  return {
    language,
    setLanguage,
    adjectiveMode,
    setAdjectiveMode,
    lifetimeCorrect,
    registerCorrect,
  };
}
