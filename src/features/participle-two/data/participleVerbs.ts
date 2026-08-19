import {
  EParticipleFormation,
  EParticiplePattern,
  EPerfectAuxiliary,
  type IParticipleQuestion,
  type IParticipleVerb,
} from "../participle.model";

interface IParticipleVerbSeed {
  infinitive: string;
  participle: string;
  auxiliary: EPerfectAuxiliary;
  formation: EParticipleFormation;
  pattern: EParticiplePattern;
  middle: string;
  reflexive: boolean;
  subject?: string;
}

interface IAuxiliaryForms {
  first: string;
  second: string;
  third: string;
  plural: string;
  ihr: string;
  pastFirst: string;
  pastThird: string;
  pastPlural: string;
  pastIhr: string;
  infinitive: string;
}

interface ISentenceParts {
  before: string;
  after: string;
  tense: IParticipleQuestion["tense"];
  isQuestion: boolean;
}

const H = EPerfectAuxiliary.Haben;
const S = EPerfectAuxiliary.Sein;
const W = EParticipleFormation.Weak;
const ST = EParticipleFormation.Strong;
const M = EParticipleFormation.Mixed;
const P = EParticiplePattern.Simple;
const SEP = EParticiplePattern.Separable;
const INSEP = EParticiplePattern.Inseparable;
const IEREN = EParticiplePattern.Ieren;

function v(
  infinitive: string,
  participle: string,
  auxiliary: EPerfectAuxiliary,
  formation: EParticipleFormation,
  pattern: EParticiplePattern,
  middle: string,
  reflexive = false,
  subject?: string,
): IParticipleVerbSeed {
  return {
    infinitive,
    participle,
    auxiliary,
    formation,
    pattern,
    middle,
    reflexive,
    subject,
  };
}

const VERB_SEEDS: IParticipleVerbSeed[] = [
  v("sein", "gewesen", S, ST, P, "zu Hause"),
  v("haben", "gehabt", H, M, P, "viel Glück"),
  v("werden", "geworden", S, ST, P, "deutlich ruhiger"),
  v("machen", "gemacht", H, W, P, "die Aufgabe"),
  v("sagen", "gesagt", H, W, P, "die Wahrheit"),
  v("gehen", "gegangen", S, ST, P, "nach Hause"),
  v("kommen", "gekommen", S, ST, P, "pünktlich zur Arbeit"),
  v("sehen", "gesehen", H, ST, P, "den neuen Film"),
  v("geben", "gegeben", H, ST, P, "dem Kind eine Chance"),
  v("wissen", "gewusst", H, M, P, "die richtige Antwort"),
  v("finden", "gefunden", H, ST, P, "den Schlüssel"),
  v("bleiben", "geblieben", S, ST, P, "noch etwas länger"),
  v("liegen", "gelegen", H, ST, P, "auf dem Sofa"),
  v("heißen", "geheißen", H, ST, P, "früher anders"),
  v("denken", "gedacht", H, M, P, "an den Termin"),
  v("nehmen", "genommen", H, ST, P, "den früheren Zug"),
  v("tun", "getan", H, ST, P, "das Richtige"),
  v("sprechen", "gesprochen", H, ST, P, "mit der Nachbarin"),
  v("bringen", "gebracht", H, M, P, "den Kuchen zur Feier"),
  v("leben", "gelebt", H, W, P, "lange in Berlin"),
  v("fahren", "gefahren", S, ST, P, "mit dem Zug nach Hamburg"),
  v("meinen", "gemeint", H, W, P, "das nicht böse"),
  v("fragen", "gefragt", H, W, P, "nach dem Weg"),
  v("kennen", "gekannt", H, M, P, "diese Stadt schon als Kind"),
  v("gelten", "gegolten", H, ST, P, "lange als zuverlässig"),
  v("stehen", "gestanden", H, ST, P, "vor der Tür"),
  v("spielen", "gespielt", H, W, P, "am Wochenende Fußball"),
  v("arbeiten", "gearbeitet", H, W, P, "bis spät in die Nacht"),
  v("brauchen", "gebraucht", H, W, P, "mehr Zeit"),
  v("folgen", "gefolgt", S, W, P, "dem markierten Weg"),
  v("lernen", "gelernt", H, W, P, "viele neue Wörter"),
  v("bestehen", "bestanden", H, ST, INSEP, "die schwierige Prüfung"),
  v("verstehen", "verstanden", H, ST, INSEP, "die Erklärung"),
  v("setzen", "gesetzt", H, W, P, "das Kind auf den Stuhl"),
  v("bekommen", "bekommen", H, ST, INSEP, "eine gute Nachricht"),
  v("beginnen", "begonnen", H, ST, INSEP, "mit der Vorbereitung"),
  v("erzählen", "erzählt", H, W, P, "eine lustige Geschichte"),
  v("versuchen", "versucht", H, W, INSEP, "alles noch einmal"),
  v("schreiben", "geschrieben", H, ST, P, "eine lange E-Mail"),
  v("laufen", "gelaufen", S, ST, P, "durch den Park"),
  v("erklären", "erklärt", H, W, P, "die Regel verständlich"),
  v("entsprechen", "entsprochen", H, ST, INSEP, "den Erwartungen", false, "Das Ergebnis"),
  v("sitzen", "gesessen", H, ST, P, "am Fenster"),
  v("ziehen", "gezogen", S, ST, P, "nach Köln"),
  v("scheinen", "geschienen", H, ST, P, "den ganzen Nachmittag", false, "Die Sonne"),
  v("fallen", "gefallen", S, ST, P, "auf den Boden"),
  v("gehören", "gehört", H, W, P, "meiner Kollegin", false, "Der Schlüssel"),
  v("entstehen", "entstanden", S, ST, INSEP, "während des Gesprächs", false, "Die Idee"),
  v("erhalten", "erhalten", H, ST, INSEP, "eine Bestätigung"),
  v("treffen", "getroffen", H, ST, P, "alte Freunde"),

  v("suchen", "gesucht", H, W, P, "eine neue Wohnung"),
  v("legen", "gelegt", H, W, P, "das Handy auf den Tisch"),
  v("vorstellen", "vorgestellt", H, W, SEP, "bei den neuen Kollegen", true),
  v("handeln", "gehandelt", H, W, P, "schnell und vernünftig"),
  v("erreichen", "erreicht", H, W, INSEP, "das Ziel rechtzeitig"),
  v("tragen", "getragen", H, ST, P, "den schweren Koffer"),
  v("schaffen", "geschafft", H, W, P, "die Arbeit ohne Hilfe"),
  v("lesen", "gelesen", H, ST, P, "den ganzen Bericht"),
  v("verlieren", "verloren", H, ST, INSEP, "meinen Ausweis"),
  v("darstellen", "dargestellt", H, W, SEP, "die Entwicklung deutlich", false, "Die Grafik"),
  v("erkennen", "erkannt", H, M, INSEP, "den Fehler sofort"),
  v("entwickeln", "entwickelt", H, W, INSEP, "eine neue Lösung"),
  v("reden", "geredet", H, W, P, "lange über das Problem"),
  v("aussehen", "ausgesehen", H, ST, SEP, "auf den Fotos glücklich"),
  v("erscheinen", "erschienen", S, ST, INSEP, "gestern online", false, "Der Artikel"),
  v("bilden", "gebildet", H, W, P, "eine kleine Arbeitsgruppe"),
  v("anfangen", "angefangen", H, ST, SEP, "mit dem neuen Kurs"),
  v("erwarten", "erwartet", H, W, INSEP, "eine klare Antwort"),
  v("wohnen", "gewohnt", H, W, P, "fünf Jahre in München"),
  v("betreffen", "betroffen", H, ST, INSEP, "das ganze Team", false, "Die Änderung"),
  v("warten", "gewartet", H, W, P, "eine Stunde auf den Bus"),
  v("vergehen", "vergangen", S, ST, INSEP, "erstaunlich schnell", false, "Die Woche"),
  v("helfen", "geholfen", H, ST, P, "einer älteren Frau"),
  v("gewinnen", "gewonnen", H, ST, P, "das wichtige Spiel"),
  v("schließen", "geschlossen", H, ST, P, "alle Fenster"),
  v("fühlen", "gefühlt", H, W, P, "nach dem Urlaub viel besser", true),
  v("bieten", "geboten", H, ST, P, "den Gästen Kaffee"),
  v("interessieren", "interessiert", H, W, IEREN, "für moderne Architektur", true),
  v("erinnern", "erinnert", H, W, INSEP, "an den ersten Schultag", true),
  v("ergeben", "ergeben", H, ST, INSEP, "ein klares Ergebnis", false, "Die Untersuchung"),
  v("anbieten", "angeboten", H, ST, SEP, "meiner Freundin Hilfe"),
  v("studieren", "studiert", H, W, IEREN, "drei Jahre Biologie"),
  v("verbinden", "verbunden", H, ST, INSEP, "die beiden Kabel"),
  v("ansehen", "angesehen", H, ST, SEP, "den Vertrag genau"),
  v("fehlen", "gefehlt", H, W, P, "in der ersten Version", false, "Der letzte Abschnitt"),
  v("bedeuten", "bedeutet", H, W, INSEP, "viel für das Team", false, "Diese Entscheidung"),
  v("vergleichen", "verglichen", H, ST, INSEP, "mehrere Angebote miteinander"),
  v("entscheiden", "entschieden", H, ST, INSEP, "für die günstigere Lösung", true),
  v("nennen", "genannt", H, M, P, "drei gute Gründe"),
  v("zeigen", "gezeigt", H, W, P, "den Gästen die Wohnung"),
  v("führen", "geführt", H, W, P, "ein langes Gespräch"),
  v("hören", "gehört", H, W, P, "das Geräusch sofort"),
  v("glauben", "geglaubt", H, W, P, "ihm zunächst nicht"),
  v("halten", "gehalten", H, ST, P, "sein Versprechen"),
  v("essen", "gegessen", H, ST, P, "eine warme Suppe"),
  v("trinken", "getrunken", H, ST, P, "genug Wasser"),
  v("schlafen", "geschlafen", H, ST, P, "acht Stunden"),
  v("kaufen", "gekauft", H, W, P, "frisches Brot"),
  v("verkaufen", "verkauft", H, W, INSEP, "das alte Fahrrad"),
  v("bezahlen", "bezahlt", H, W, INSEP, "die Rechnung online"),

  v("öffnen", "geöffnet", H, W, P, "das Fenster"),
  v("schicken", "geschickt", H, W, P, "die Unterlagen per E-Mail"),
  v("senden", "gesendet", H, W, P, "eine kurze Nachricht"),
  v("wählen", "gewählt", H, W, P, "eine andere Route"),
  v("planen", "geplant", H, W, P, "eine Reise nach Wien"),
  v("reisen", "gereist", S, W, P, "allein durch Europa"),
  v("besuchen", "besucht", H, W, INSEP, "seine Großeltern"),
  v("nutzen", "genutzt", H, W, P, "die freie Zeit"),
  v("benutzen", "benutzt", H, W, INSEP, "das neue Werkzeug"),
  v("wechseln", "gewechselt", H, W, P, "den Anbieter"),
  v("ändern", "geändert", H, W, P, "den ursprünglichen Plan"),
  v("verbessern", "verbessert", H, W, INSEP, "die Aussprache deutlich"),
  v("vergessen", "vergessen", H, ST, INSEP, "den Termin völlig"),
  v("teilnehmen", "teilgenommen", H, ST, SEP, "an der Besprechung"),
  v("passieren", "passiert", S, W, IEREN, "am frühen Morgen", false, "Der Unfall"),
  v("bestellen", "bestellt", H, W, INSEP, "zwei Tassen Kaffee"),
  v("antworten", "geantwortet", H, W, P, "sofort auf die Nachricht"),
  v("verlassen", "verlassen", H, ST, INSEP, "das Büro sehr spät"),
  v("lieben", "geliebt", H, W, P, "diesen Ort schon immer"),
  v("hassen", "gehasst", H, W, P, "lange Wartezeiten"),
  v("hoffen", "gehofft", H, W, P, "auf besseres Wetter"),
  v("wünschen", "gewünscht", H, W, P, "mehr Ruhe", true),
  v("bewegen", "bewegt", H, W, INSEP, "heute viel zu wenig", true),
  v("wachsen", "gewachsen", S, ST, P, "in wenigen Wochen kräftig", false, "Die Pflanze"),
  v("sterben", "gestorben", S, ST, P, "nach dem trockenen Sommer", false, "Der alte Baum"),
  v("steigen", "gestiegen", S, ST, P, "erneut deutlich", false, "Der Preis"),
  v("sinken", "gesunken", S, ST, P, "über Nacht stark", false, "Die Temperatur"),
  v("fliegen", "geflogen", S, ST, P, "nach Spanien"),
  v("schwimmen", "geschwommen", S, ST, P, "bis zum anderen Ufer"),
  v("tanzen", "getanzt", H, W, P, "die ganze Nacht"),
  v("singen", "gesungen", H, ST, P, "sein Lieblingslied"),
  v("lachen", "gelacht", H, W, P, "laut über den Witz"),
  v("weinen", "geweint", H, W, P, "vor Erleichterung"),
  v("kochen", "gekocht", H, W, P, "eine große Portion Suppe"),
  v("backen", "gebacken", H, ST, P, "einen Apfelkuchen"),
  v("waschen", "gewaschen", H, ST, P, "alle Handtücher"),
  v("duschen", "geduscht", H, W, P, "nach dem Training"),
  v("anziehen", "angezogen", H, ST, SEP, "für die Feier elegant", true),
  v("ausziehen", "ausgezogen", S, ST, SEP, "aus der alten Wohnung"),
  v("aufstehen", "aufgestanden", S, ST, SEP, "heute besonders früh"),
  v("einkaufen", "eingekauft", H, W, SEP, "für das Wochenende"),
  v("anrufen", "angerufen", H, ST, SEP, "seine Mutter am Abend"),
  v("aufhören", "aufgehört", H, W, SEP, "mit dem Rauchen"),
  v("zurückkommen", "zurückgekommen", S, ST, SEP, "erst nach Mitternacht"),
  v("mitbringen", "mitgebracht", H, M, SEP, "eine Flasche Wein"),
  v("abholen", "abgeholt", H, W, SEP, "das Paket bei der Post"),
  v("aufmachen", "aufgemacht", H, W, SEP, "die Tür für den Gast"),
  v("zumachen", "zugemacht", H, W, SEP, "alle Fenster vor dem Sturm"),
  v("einschalten", "eingeschaltet", H, W, SEP, "die Heizung"),
  v("ausschalten", "ausgeschaltet", H, W, SEP, "das Licht im Flur"),

  v("anmelden", "angemeldet", H, W, SEP, "für den Sprachkurs", true),
  v("abmelden", "abgemeldet", H, W, SEP, "rechtzeitig vom Newsletter", true),
  v("einladen", "eingeladen", H, ST, SEP, "alle Nachbarn zur Feier"),
  v("absagen", "abgesagt", H, W, SEP, "den Termin kurzfristig"),
  v("zusagen", "zugesagt", H, W, SEP, "sofort bei dem Projekt"),
  v("vorbereiten", "vorbereitet", H, W, INSEP, "gründlich auf die Prüfung", true),
  v("beschreiben", "beschrieben", H, ST, INSEP, "den Weg sehr genau"),
  v("berichten", "berichtet", H, W, INSEP, "ausführlich über das Ergebnis"),
  v("informieren", "informiert", H, W, IEREN, "alle Beteiligten rechtzeitig"),
  v("diskutieren", "diskutiert", H, W, IEREN, "lange über den Vorschlag"),
  v("telefonieren", "telefoniert", H, W, IEREN, "eine Stunde mit der Schwester"),
  v("organisieren", "organisiert", H, W, IEREN, "die gesamte Veranstaltung"),
  v("reservieren", "reserviert", H, W, IEREN, "einen Tisch für vier Personen"),
  v("reparieren", "repariert", H, W, IEREN, "die kaputte Kaffeemaschine"),
  v("kontrollieren", "kontrolliert", H, W, IEREN, "alle Angaben sorgfältig"),
  v("akzeptieren", "akzeptiert", H, W, IEREN, "die neue Regel"),
  v("reagieren", "reagiert", H, W, IEREN, "ruhig auf die Kritik"),
  v("funktionieren", "funktioniert", H, W, IEREN, "nach dem Neustart wieder", false, "Das Gerät"),
  v("produzieren", "produziert", H, W, IEREN, "weniger Abfall", false, "Die Fabrik"),
  v("reduzieren", "reduziert", H, W, IEREN, "den Energieverbrauch deutlich"),
  v("feiern", "gefeiert", H, W, P, "bis spät in die Nacht"),
  v("heiraten", "geheiratet", H, W, P, "im kleinen Kreis"),
  v("kündigen", "gekündigt", H, W, P, "den alten Vertrag"),
  v("mieten", "gemietet", H, W, P, "eine Wohnung am Stadtrand"),
  v("vermieten", "vermietet", H, W, INSEP, "das freie Zimmer"),
  v("sparen", "gespart", H, W, P, "lange für die Reise"),
  v("kosten", "gekostet", H, W, P, "fast hundert Euro", false, "Das Ticket"),
  v("verdienen", "verdient", H, W, INSEP, "das erste eigene Geld"),
  v("zahlen", "gezahlt", H, W, P, "die Rechnung bar"),
  v("leihen", "geliehen", H, ST, P, "seinem Bruder das Auto"),
  v("ausleihen", "ausgeliehen", H, ST, SEP, "ein Fahrrad für den Ausflug", true),
  v("zurückgeben", "zurückgegeben", H, ST, SEP, "das Buch pünktlich"),
  v("besitzen", "besessen", H, ST, INSEP, "früher ein kleines Haus"),
  v("reichen", "gereicht", H, W, P, "für alle Gäste", false, "Das Essen"),
  v("dauern", "gedauert", H, W, P, "fast drei Stunden", false, "Die Reparatur"),
  v("enden", "geendet", H, W, P, "mit einer guten Lösung", false, "Das Gespräch"),
  v("stoppen", "gestoppt", H, W, P, "den Prozess rechtzeitig"),
  v("unterschreiben", "unterschrieben", H, ST, INSEP, "den neuen Vertrag"),
  v("beantragen", "beantragt", H, W, INSEP, "eine neue Aufenthaltserlaubnis"),
  v("erlauben", "erlaubt", H, W, P, "dem Kind eine Ausnahme"),
  v("verbieten", "verboten", H, ST, INSEP, "das Parken vor dem Haus"),
  v("bitten", "gebeten", H, ST, P, "eine Kollegin um Hilfe"),
  v("danken", "gedankt", H, W, P, "allen für ihre Unterstützung"),
  v("gratulieren", "gratuliert", H, W, IEREN, "einem Freund zum Geburtstag"),
  v("entschuldigen", "entschuldigt", H, W, INSEP, "für die Verspätung", true),
  v("versprechen", "versprochen", H, ST, INSEP, "absolute Vertraulichkeit"),
  v("empfehlen", "empfohlen", H, ST, INSEP, "dieses Restaurant"),
  v("vorschlagen", "vorgeschlagen", H, ST, SEP, "einen späteren Termin"),
  v("zustimmen", "zugestimmt", H, W, SEP, "dem Vorschlag ohne Zweifel"),
  v("ablehnen", "abgelehnt", H, W, SEP, "das Angebot höflich"),
];

function toVerbId(infinitive: string) {
  return infinitive
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss");
}

export const PARTICIPLE_VERBS: IParticipleVerb[] = VERB_SEEDS.map(
  (seed, index) => ({
    ...seed,
    id: toVerbId(seed.infinitive),
    rank: index + 1,
  }),
);

const AUXILIARIES: Record<EPerfectAuxiliary, IAuxiliaryForms> = {
  [EPerfectAuxiliary.Haben]: {
    first: "habe",
    second: "hast",
    third: "hat",
    plural: "haben",
    ihr: "habt",
    pastFirst: "hatte",
    pastThird: "hatte",
    pastPlural: "hatten",
    pastIhr: "hattet",
    infinitive: "haben",
  },
  [EPerfectAuxiliary.Sein]: {
    first: "bin",
    second: "bist",
    third: "ist",
    plural: "sind",
    ihr: "seid",
    pastFirst: "war",
    pastThird: "war",
    pastPlural: "waren",
    pastIhr: "wart",
    infinitive: "sein",
  },
};

function lowerFirst(value: string) {
  return value.charAt(0).toLocaleLowerCase("de") + value.slice(1);
}

function upperFirst(value: string) {
  return value.charAt(0).toLocaleUpperCase("de") + value.slice(1);
}

function phrase(
  verb: IParticipleVerb,
  reflexivePronoun: string,
  temporal: string,
) {
  return [verb.reflexive ? reflexivePronoun : "", temporal, verb.middle]
    .filter(Boolean)
    .join(" ");
}

function personalSentence(
  verb: IParticipleVerb,
  template: number,
): ISentenceParts {
  const aux = AUXILIARIES[verb.auxiliary];
  switch (template) {
    case 0:
      return { before: `Ich ${aux.first} ${phrase(verb, "mich", "gestern")} `, after: ".", tense: "Perfekt", isQuestion: false };
    case 1:
      return { before: `${upperFirst(aux.second)} du ${phrase(verb, "dich", "schon")} `, after: "?", tense: "Perfekt", isQuestion: true };
    case 2:
      return { before: `Sie war überrascht, weil er ${phrase(verb, "sich", "schon")} `, after: ` ${aux.third}.`, tense: "Perfekt", isQuestion: false };
    case 3:
      return { before: `Wir ${aux.pastPlural} ${phrase(verb, "uns", "zuvor")} `, after: ", bevor der nächste Termin begann.", tense: "Plusquamperfekt", isQuestion: false };
    case 4:
      return { before: `Nachdem ihr ${phrase(verb, "euch", "alles in Ruhe")} `, after: ` ${aux.pastIhr}, konntet ihr endlich weitermachen.`, tense: "Plusquamperfekt", isQuestion: false };
    case 5:
      return { before: `Er ${aux.third} ${phrase(verb, "sich", "noch nie")} `, after: ".", tense: "Perfekt", isQuestion: false };
    case 6:
      return { before: `Warum ${aux.second} du ${phrase(verb, "dich", "diesmal")} `, after: "?", tense: "Perfekt", isQuestion: true };
    case 7:
      return { before: `Bis dahin ${aux.pastFirst} ich ${phrase(verb, "mich", "längst")} `, after: ", als die Nachricht kam.", tense: "Plusquamperfekt", isQuestion: false };
    case 8:
      return { before: `Sie sagt, dass wir ${phrase(verb, "uns", "bereits")} `, after: ` ${aux.plural}.`, tense: "Perfekt", isQuestion: false };
    case 9:
      return { before: `Am Ende ${aux.plural} sie ${phrase(verb, "sich", "doch noch")} `, after: ".", tense: "Perfekt", isQuestion: false };
    case 10:
      return { before: `Morgen wird er ${phrase(verb, "sich", "bestimmt")} `, after: ` ${aux.infinitive}.`, tense: "Futur II", isQuestion: false };
    default:
      return { before: `Ich wusste nicht, dass ihr ${phrase(verb, "euch", "zuvor")} `, after: ` ${aux.pastIhr}.`, tense: "Plusquamperfekt", isQuestion: false };
  }
}

function subjectSentence(
  verb: IParticipleVerb,
  template: number,
): ISentenceParts {
  const aux = AUXILIARIES[verb.auxiliary];
  const subject = verb.subject ?? "Das Ereignis";
  const inlineSubject = lowerFirst(subject);
  const content = (temporal: string) => phrase(verb, "sich", temporal);
  switch (template) {
    case 0:
      return { before: `${subject} ${aux.third} ${content("gestern")} `, after: ".", tense: "Perfekt", isQuestion: false };
    case 1:
      return { before: `${upperFirst(aux.third)} ${inlineSubject} ${content("schon")} `, after: "?", tense: "Perfekt", isQuestion: true };
    case 2:
      return { before: `Es war überraschend, weil ${inlineSubject} ${content("so schnell")} `, after: ` ${aux.third}.`, tense: "Perfekt", isQuestion: false };
    case 3:
      return { before: `${subject} ${aux.pastThird} ${content("zuvor")} `, after: ", bevor der nächste Termin begann.", tense: "Plusquamperfekt", isQuestion: false };
    case 4:
      return { before: `Nachdem ${inlineSubject} ${content("vollständig")} `, after: ` ${aux.pastThird}, änderte sich die Situation.`, tense: "Plusquamperfekt", isQuestion: false };
    case 5:
      return { before: `${subject} ${aux.third} ${content("noch nie")} `, after: ".", tense: "Perfekt", isQuestion: false };
    case 6:
      return { before: `Warum ${aux.third} ${inlineSubject} ${content("diesmal")} `, after: "?", tense: "Perfekt", isQuestion: true };
    case 7:
      return { before: `Bis dahin ${aux.pastThird} ${inlineSubject} ${content("längst")} `, after: ", als die Nachricht kam.", tense: "Plusquamperfekt", isQuestion: false };
    case 8:
      return { before: `Man sieht, dass ${inlineSubject} ${content("bereits")} `, after: ` ${aux.third}.`, tense: "Perfekt", isQuestion: false };
    case 9:
      return { before: `Am Ende ${aux.third} ${inlineSubject} ${content("doch noch")} `, after: ".", tense: "Perfekt", isQuestion: false };
    case 10:
      return { before: `Morgen wird ${inlineSubject} ${content("bestimmt")} `, after: ` ${aux.infinitive}.`, tense: "Futur II", isQuestion: false };
    default:
      return { before: `Ich wusste nicht, dass ${inlineSubject} ${content("zuvor")} `, after: ` ${aux.pastThird}.`, tense: "Plusquamperfekt", isQuestion: false };
  }
}

function makeQuestion(
  verb: IParticipleVerb,
  variant: number,
): IParticipleQuestion {
  const template = (verb.rank - 1 + variant * 4) % 12;
  const sentence = verb.subject
    ? subjectSentence(verb, template)
    : personalSentence(verb, template);
  return {
    id: `${verb.id}-${variant + 1}`,
    verbId: verb.id,
    before: sentence.before,
    after: sentence.after,
    answer: verb.participle,
    infinitive: verb.infinitive,
    tense: sentence.tense,
    isQuestion: sentence.isQuestion,
  };
}

export const PARTICIPLE_QUESTIONS: IParticipleQuestion[] =
  PARTICIPLE_VERBS.flatMap((verb) => [0, 1, 2].map((variant) => makeQuestion(verb, variant)));

export const PARTICIPLE_VERBS_BY_ID = new Map(
  PARTICIPLE_VERBS.map((verb) => [verb.id, verb]),
);
