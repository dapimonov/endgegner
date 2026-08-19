import { EXTRA_QUESTIONS } from "./questionsExtra";

export interface IQuestion {
  id: number;
  before: string;
  after: string;
  lemma: string;
  answer: string;
  ending: "e" | "en" | "er" | "es" | "em";
  clue: string;
  caseKey: "nom" | "acc" | "dat" | "gen";
  gender: "m" | "f" | "n" | "pl";
  article: "definite" | "ein" | "quantity" | "zero";
}

const BASE_QUESTIONS: IQuestion[] = [
  { id: 1, before: "Der ", after: " Kollege beginnt heute.", lemma: "neu", answer: "neue", ending: "e", clue: "der", caseKey: "nom", gender: "m", article: "definite" },
  { id: 2, before: "Die ", after: " Ärztin erklärt alles.", lemma: "freundlich", answer: "freundliche", ending: "e", clue: "die", caseKey: "nom", gender: "f", article: "definite" },
  { id: 3, before: "Das ", after: " Kind schläft schon.", lemma: "klein", answer: "kleine", ending: "e", clue: "das", caseKey: "nom", gender: "n", article: "definite" },
  { id: 4, before: "Die ", after: " Schuhe stehen im Flur.", lemma: "rot", answer: "roten", ending: "en", clue: "die", caseKey: "nom", gender: "pl", article: "definite" },
  { id: 5, before: "Ich sehe den ", after: " Turm.", lemma: "alt", answer: "alten", ending: "en", clue: "den", caseKey: "acc", gender: "m", article: "definite" },
  { id: 6, before: "Sie kauft die ", after: " Jacke.", lemma: "blau", answer: "blaue", ending: "e", clue: "die", caseKey: "acc", gender: "f", article: "definite" },
  { id: 7, before: "Wir besuchen das ", after: " Museum.", lemma: "neu", answer: "neue", ending: "e", clue: "das", caseKey: "acc", gender: "n", article: "definite" },
  { id: 8, before: "Er repariert die ", after: " Fahrräder.", lemma: "kaputt", answer: "kaputten", ending: "en", clue: "die", caseKey: "acc", gender: "pl", article: "definite" },
  { id: 9, before: "Ich spreche mit dem ", after: " Nachbarn.", lemma: "neu", answer: "neuen", ending: "en", clue: "mit dem", caseKey: "dat", gender: "m", article: "definite" },
  { id: 10, before: "Sie hilft der ", after: " Mutter.", lemma: "jung", answer: "jungen", ending: "en", clue: "der", caseKey: "dat", gender: "f", article: "definite" },
  { id: 11, before: "Wir wohnen in dem ", after: " Viertel.", lemma: "ruhig", answer: "ruhigen", ending: "en", clue: "in dem", caseKey: "dat", gender: "n", article: "definite" },
  { id: 12, before: "Er fährt mit den ", after: " Verkehrsmitteln.", lemma: "öffentlich", answer: "öffentlichen", ending: "en", clue: "mit den", caseKey: "dat", gender: "pl", article: "definite" },
  { id: 13, before: "Wegen des ", after: " Regens bleiben wir zu Hause.", lemma: "stark", answer: "starken", ending: "en", clue: "wegen des", caseKey: "gen", gender: "m", article: "definite" },
  { id: 14, before: "Trotz der ", after: " Wartezeit bleiben alle ruhig.", lemma: "lang", answer: "langen", ending: "en", clue: "trotz der", caseKey: "gen", gender: "f", article: "definite" },
  { id: 15, before: "Während des ", after: " Gesprächs war sie konzentriert.", lemma: "ganz", answer: "ganzen", ending: "en", clue: "während des", caseKey: "gen", gender: "n", article: "definite" },
  { id: 16, before: "Die Farbe der ", after: " Häuser gefällt mir.", lemma: "alt", answer: "alten", ending: "en", clue: "der", caseKey: "gen", gender: "pl", article: "definite" },
  { id: 17, before: "Ein ", after: " Plan spart Zeit.", lemma: "gut", answer: "guter", ending: "er", clue: "ein", caseKey: "nom", gender: "m", article: "ein" },
  { id: 18, before: "Eine ", after: " Suppe wartet auf dich.", lemma: "warm", answer: "warme", ending: "e", clue: "eine", caseKey: "nom", gender: "f", article: "ein" },
  { id: 19, before: "Ein ", after: " Bier wäre jetzt schön.", lemma: "kalt", answer: "kaltes", ending: "es", clue: "ein", caseKey: "nom", gender: "n", article: "ein" },
  { id: 20, before: "Meine ", after: " Kollegen kommen später.", lemma: "neu", answer: "neuen", ending: "en", clue: "meine", caseKey: "nom", gender: "pl", article: "ein" },
  { id: 21, before: "Ich brauche einen ", after: " Platz.", lemma: "ruhig", answer: "ruhigen", ending: "en", clue: "einen", caseKey: "acc", gender: "m", article: "ein" },
  { id: 22, before: "Sie bestellt eine ", after: " Schokolade.", lemma: "heiß", answer: "heiße", ending: "e", clue: "eine", caseKey: "acc", gender: "f", article: "ein" },
  { id: 23, before: "Wir suchen ein ", after: " Hotel.", lemma: "günstig", answer: "günstiges", ending: "es", clue: "ein", caseKey: "acc", gender: "n", article: "ein" },
  { id: 24, before: "Er trägt keine ", after: " Schuhe.", lemma: "schwarz", answer: "schwarzen", ending: "en", clue: "keine", caseKey: "acc", gender: "pl", article: "ein" },
  { id: 25, before: "Mit einem ", after: " Messer geht es leichter.", lemma: "scharf", answer: "scharfen", ending: "en", clue: "mit einem", caseKey: "dat", gender: "n", article: "ein" },
  { id: 26, before: "Nach einer ", after: " Pause geht es weiter.", lemma: "kurz", answer: "kurzen", ending: "en", clue: "nach einer", caseKey: "dat", gender: "f", article: "ein" },
  { id: 27, before: "Wir sitzen in einem ", after: " Café.", lemma: "gemütlich", answer: "gemütlichen", ending: "en", clue: "in einem", caseKey: "dat", gender: "n", article: "ein" },
  { id: 28, before: "Ich telefoniere mit meinen ", after: " Freunden.", lemma: "alt", answer: "alten", ending: "en", clue: "mit meinen", caseKey: "dat", gender: "pl", article: "ein" },
  { id: 29, before: "Wegen eines ", after: " Problems fällt der Zug aus.", lemma: "technisch", answer: "technischen", ending: "en", clue: "wegen eines", caseKey: "gen", gender: "n", article: "ein" },
  { id: 30, before: "Trotz einer ", after: " Warnung ging er weiter.", lemma: "klar", answer: "klaren", ending: "en", clue: "trotz einer", caseKey: "gen", gender: "f", article: "ein" },
  { id: 31, before: "Die Stimme eines ", after: " Sängers füllt den Raum.", lemma: "bekannt", answer: "bekannten", ending: "en", clue: "eines", caseKey: "gen", gender: "m", article: "ein" },
  { id: 32, before: "Die Stimmen meiner ", after: " Nachbarn wecken mich.", lemma: "neu", answer: "neuen", ending: "en", clue: "meiner", caseKey: "gen", gender: "pl", article: "ein" },
  { id: 33, before: "", after: " Kaffee riecht wunderbar.", lemma: "frisch", answer: "frischer", ending: "er", clue: "—", caseKey: "nom", gender: "m", article: "zero" },
  { id: 34, before: "", after: " Luft kommt durchs Fenster.", lemma: "kalt", answer: "kalte", ending: "e", clue: "—", caseKey: "nom", gender: "f", article: "zero" },
  { id: 35, before: "", after: " Brot schmeckt am besten.", lemma: "warm", answer: "warmes", ending: "es", clue: "—", caseKey: "nom", gender: "n", article: "zero" },
  { id: 36, before: "", after: " Ideen entstehen oft beim Spazierengehen.", lemma: "gut", answer: "gute", ending: "e", clue: "—", caseKey: "nom", gender: "pl", article: "zero" },
  { id: 37, before: "Ich trinke ", after: " Kaffee.", lemma: "stark", answer: "starken", ending: "en", clue: "—", caseKey: "acc", gender: "m", article: "zero" },
  { id: 38, before: "Sie braucht ", after: " Luft.", lemma: "frisch", answer: "frische", ending: "e", clue: "—", caseKey: "acc", gender: "f", article: "zero" },
  { id: 39, before: "Wir kaufen ", after: " Werkzeug.", lemma: "günstig", answer: "günstiges", ending: "es", clue: "—", caseKey: "acc", gender: "n", article: "zero" },
  { id: 40, before: "Er sammelt ", after: " Fotos.", lemma: "alt", answer: "alte", ending: "e", clue: "—", caseKey: "acc", gender: "pl", article: "zero" },
  { id: 41, before: "Mit ", after: " Kaffee beginnt der Tag besser.", lemma: "heiß", answer: "heißem", ending: "em", clue: "mit", caseKey: "dat", gender: "m", article: "zero" },
  { id: 42, before: "Bei ", after: " Wetter essen wir draußen.", lemma: "schön", answer: "schönem", ending: "em", clue: "bei", caseKey: "dat", gender: "n", article: "zero" },
  { id: 43, before: "Mit ", after: " Milch schmeckt der Kakao besser.", lemma: "frisch", answer: "frischer", ending: "er", clue: "mit", caseKey: "dat", gender: "f", article: "zero" },
  { id: 44, before: "Mit ", after: " Freunden vergeht die Zeit schnell.", lemma: "gut", answer: "guten", ending: "en", clue: "mit", caseKey: "dat", gender: "pl", article: "zero" },
  { id: 45, before: "Trotz ", after: " Regens gehen wir raus.", lemma: "stark", answer: "starken", ending: "en", clue: "trotz", caseKey: "gen", gender: "m", article: "zero" },
  { id: 46, before: "Trotz ", after: " Hitze läuft er weiter.", lemma: "groß", answer: "großer", ending: "er", clue: "trotz", caseKey: "gen", gender: "f", article: "zero" },
  { id: 47, before: "Wegen ", after: " Wetters bleiben die Fenster zu.", lemma: "schlecht", answer: "schlechten", ending: "en", clue: "wegen", caseKey: "gen", gender: "n", article: "zero" },
  { id: 48, before: "Aufgrund ", after: " Daten ändern wir den Plan.", lemma: "aktuell", answer: "aktueller", ending: "er", clue: "aufgrund", caseKey: "gen", gender: "pl", article: "zero" },
  { id: 49, before: "Der ", after: " Zug fährt um sieben.", lemma: "erst", answer: "erste", ending: "e", clue: "der", caseKey: "nom", gender: "m", article: "definite" },
  { id: 50, before: "Ich nehme die ", after: " Verbindung.", lemma: "schnell", answer: "schnelle", ending: "e", clue: "die", caseKey: "acc", gender: "f", article: "definite" },
  { id: 51, before: "Sie arbeitet in der ", after: " Küche.", lemma: "offen", answer: "offenen", ending: "en", clue: "in der", caseKey: "dat", gender: "f", article: "definite" },
  { id: 52, before: "Das Ende der ", after: " Geschichte überrascht alle.", lemma: "spannend", answer: "spannenden", ending: "en", clue: "der", caseKey: "gen", gender: "f", article: "definite" },
  { id: 53, before: "Kein ", after: " Mensch glaubt diese Ausrede.", lemma: "vernünftig", answer: "vernünftiger", ending: "er", clue: "kein", caseKey: "nom", gender: "m", article: "ein" },
  { id: 54, before: "Wir haben einen ", after: " Termin.", lemma: "wichtig", answer: "wichtigen", ending: "en", clue: "einen", caseKey: "acc", gender: "m", article: "ein" },
  { id: 55, before: "Sie findet eine ", after: " Lösung.", lemma: "einfach", answer: "einfache", ending: "e", clue: "eine", caseKey: "acc", gender: "f", article: "ein" },
  { id: 56, before: "Er kauft ein ", after: " Regal.", lemma: "praktisch", answer: "praktisches", ending: "es", clue: "ein", caseKey: "acc", gender: "n", article: "ein" },
  { id: 57, before: "Ich spreche mit keiner ", after: " Person.", lemma: "fremd", answer: "fremden", ending: "en", clue: "mit keiner", caseKey: "dat", gender: "f", article: "ein" },
  { id: 58, before: "Der Geruch eines ", after: " Brotes erfüllt die Küche.", lemma: "frisch", answer: "frischen", ending: "en", clue: "eines", caseKey: "gen", gender: "n", article: "ein" },
  { id: 59, before: "", after: " Schlaf ist wichtig.", lemma: "gesund", answer: "gesunder", ending: "er", clue: "—", caseKey: "nom", gender: "m", article: "zero" },
  { id: 60, before: "Wir brauchen ", after: " Wasser.", lemma: "sauber", answer: "sauberes", ending: "es", clue: "—", caseKey: "acc", gender: "n", article: "zero" },
  { id: 61, before: "Sie arbeitet mit ", after: " Geräten.", lemma: "modern", answer: "modernen", ending: "en", clue: "mit", caseKey: "dat", gender: "pl", article: "zero" },
  { id: 62, before: "Nach ", after: " Arbeit brauche ich eine Pause.", lemma: "lang", answer: "langer", ending: "er", clue: "nach", caseKey: "dat", gender: "f", article: "zero" },
  { id: 63, before: "Der Duft der ", after: " Blumen füllt den Garten.", lemma: "frisch", answer: "frischen", ending: "en", clue: "der", caseKey: "gen", gender: "pl", article: "definite" },
  { id: 64, before: "Seine ", after: " Antwort überrascht niemanden.", lemma: "kurz", answer: "kurze", ending: "e", clue: "seine", caseKey: "nom", gender: "f", article: "ein" },
];

export const QUESTIONS: IQuestion[] = [...BASE_QUESTIONS, ...EXTRA_QUESTIONS];
