"use client";

import { useState } from "react";

import { CArenaScreen } from "../../features/arena/CArenaScreen/CArenaScreen";
import { CAdjectiveTrainer } from "../../features/adjective-endings/CAdjectiveTrainer/CAdjectiveTrainer";
import { CVerbTrainer } from "../../features/verb-patterns/CVerbTrainer/CVerbTrainer";
import { CParticipleTrainer } from "../../features/participle-two/CParticipleTrainer/CParticipleTrainer";
import { EAppView } from "../../shared/model";
import { useAppPreferences } from "../useAppPreferences";

export function CEndgegnerApp() {
  const [view, setView] = useState(EAppView.Arena);
  const preferences = useAppPreferences();

  if (view === EAppView.AdjectiveEndings) {
    return (
      <CAdjectiveTrainer
        language={preferences.language}
        onLanguageChange={preferences.setLanguage}
        mode={preferences.adjectiveMode}
        onModeChange={preferences.setAdjectiveMode}
        lifetimeCorrect={preferences.lifetimeCorrect}
        onCorrect={preferences.registerCorrect}
        onHome={() => setView(EAppView.Arena)}
      />
    );
  }

  if (view === EAppView.VerbPatterns) {
    return (
      <CVerbTrainer
        language={preferences.language}
        onLanguageChange={preferences.setLanguage}
        lifetimeCorrect={preferences.lifetimeCorrect}
        onCorrect={preferences.registerCorrect}
        onHome={() => setView(EAppView.Arena)}
      />
    );
  }

  if (view === EAppView.ParticipleTwo) {
    return (
      <CParticipleTrainer
        language={preferences.language}
        onLanguageChange={preferences.setLanguage}
        lifetimeCorrect={preferences.lifetimeCorrect}
        onCorrect={preferences.registerCorrect}
        onHome={() => setView(EAppView.Arena)}
      />
    );
  }

  return (
    <CArenaScreen
      language={preferences.language}
      onLanguageChange={preferences.setLanguage}
      lifetimeCorrect={preferences.lifetimeCorrect}
      onAdjectiveTrainer={() => setView(EAppView.AdjectiveEndings)}
      onVerbTrainer={() => setView(EAppView.VerbPatterns)}
      onParticipleTrainer={() => setView(EAppView.ParticipleTwo)}
    />
  );
}
