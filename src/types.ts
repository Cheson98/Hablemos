// Datamodel van Hablemos. De lesinhoud staat als JSON in src/content/levels/levelNN.json
// en moet voldoen aan deze types (zie docs/CONTENT_GUIDE.md en scripts/validate-content.mjs).

export type Example = { es: string; nl: string };

export type TipTone = 'tip' | 'warn' | 'spain' | 'police';

export type Card =
  | { kind: 'text'; title?: string; body: string }
  | { kind: 'examples'; title?: string; intro?: string; items: Example[] }
  | { kind: 'table'; title?: string; intro?: string; head: string[]; rows: string[][]; note?: string }
  | { kind: 'tip'; tone?: TipTone; title?: string; body: string };

/** Typische fout met bijbehorende uitleg. `match` wordt vergeleken met het genormaliseerde antwoord van de gebruiker. */
export type WrongPattern = { match: string; feedback: string };

export interface ExerciseBase {
  id: string;
  /** Hint (Nederlands) achter de 💡-knop. */
  hint?: string;
  /** Uitleg (Nederlands) die na het antwoord getoond wordt. */
  explain?: string;
  /** Nederlandse vertaling van de Spaanse zin in de opgave (voor de 🌐-knop). */
  nl?: string;
  /** Typische fouten (alleen bij getypte antwoorden). */
  wrong?: WrongPattern[];
  /** Zet op true als het onderwerpswoord (yo, ella, ...) bewust verplicht is in het antwoord. */
  strictSubject?: boolean;
  /** Wordt automatisch gevuld bij gespreksbeurten: de regel van de gesprekspartner. */
  npc?: { es: string; nl: string };
  /** Grammaticatag voor statistieken, bv. "ser" of "indefinido". */
  tag?: string;
}

export interface ChoiceEx extends ExerciseBase {
  type: 'choice';
  prompt: string;
  promptLang?: 'nl' | 'es';
  options: string[];
  answer: number;
  /** Taal van de antwoordopties. Standaard 'es'. */
  optionsLang?: 'nl' | 'es';
  /** Nederlandse vertaling per optie (alleen nuttig als de opties Spaans zijn); zichtbaar via de 🌐-knop. */
  optionsNl?: string[];
  /** Spaanse tekst die voorgelezen kan worden (zonder ___). */
  speak?: string;
}

export interface FillEx extends ExerciseBase {
  type: 'fill';
  /** Spaanse zin met precies één ___ . */
  sentence: string;
  /** Geaccepteerde invullingen (alleen het ontbrekende stuk). */
  answers: string[];
  /** Hulpregel zoals "(hablar, nosotros)". */
  base?: string;
}

export interface BuildEx extends ExerciseBase {
  type: 'build';
  /** Nederlandse zin of situatie die in het Spaans gebouwd moet worden. */
  prompt: string;
  /** Alle woorden (juiste woorden + afleiders), in willekeurige volgorde. */
  words: string[];
  /** Geaccepteerde volledige zinnen; de eerste is de modelzin. */
  answers: string[];
}

export interface ListenEx extends ExerciseBase {
  type: 'listen';
  /** De Spaanse tekst die voorgelezen wordt. */
  es: string;
  mode: 'choose' | 'type';
  options?: string[];
  answer?: number;
  answers?: string[];
}

export interface WriteEx extends ExerciseBase {
  type: 'write';
  /** Nederlandse zin of situatie die in het Spaans geschreven moet worden. */
  prompt: string;
  answers: string[];
}

export type Exercise = ChoiceEx | FillEx | BuildEx | ListenEx | WriteEx;

export type DialogueTurn =
  | { who: 'npc'; es: string; nl: string }
  | { who: 'you'; ex: Exercise };

export interface Dialogue {
  /** Nederlandse omschrijving van de situatie en jouw rol. */
  setting: string;
  /** Welke aanspreekvorm hoort bij dit gesprek. */
  formal: 'usted' | 'tú' | 'mixed';
  npcName: string;
  npcEmoji: string;
  tags?: string[];
  turns: DialogueTurn[];
}

export type LessonKind = 'learn' | 'practice' | 'dialogue' | 'test';

export interface Lesson {
  id: string;
  kind: LessonKind;
  title: string;
  emoji: string;
  cards?: Card[];
  quiz?: Exercise[];
  exercises?: Exercise[];
  dialogue?: Dialogue;
}

export interface Level {
  n: number;
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  /** 'nl' = opdrachtregels Nederlands, 'mix' = Spaans met Nederlands eronder, 'es' = Spaans. */
  instructionLang: 'nl' | 'mix' | 'es';
  goals: string[];
  badge: { name: string; emoji: string; desc: string };
  lessons: Lesson[];
}

// ---------- Voortgang ----------

export type LessonResult = { done: number; stars: number; best: number; last: number };

export type Settings = {
  rate: 'normaal' | 'langzaam';
  autoplay: boolean;
  listenMode: boolean;
  unlockAll: boolean;
};

export type Progress = {
  version: 1;
  xp: number;
  streak: { count: number; best: number; lastDay: string };
  lessons: Record<string, LessonResult>;
  mistakes: Record<string, { n: number; ok: number; last: number }>;
  stats: {
    correct: number;
    total: number;
    byType: Record<string, { c: number; t: number }>;
    reviewed: number;
    policeDialogues: number;
  };
  badges: Record<string, string>;
  settings: Settings;
  onboardingDone: boolean;
};
