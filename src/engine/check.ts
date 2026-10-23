// Antwoordcontrole voor alle oefenvormen.
import type { Exercise, WrongPattern } from '../types';
import { distance, dropSubject, fillSentence, fold, norm } from './text';

export type Status = 'correct' | 'accent' | 'almost' | 'wrong';

export type Answer = { choice?: number; text?: string };

export type Verdict = {
  correct: boolean;
  status: Status;
  /** Het juiste antwoord, zoals het getoond wordt. */
  expected: string;
  /** Extra uitleg bij een typische fout. */
  feedback?: string;
};

/**
 * Vergelijkt een getypt antwoord met de geaccepteerde antwoorden.
 * - correct: gelijk (hoofdletters en leestekens maken niet uit; yo/tú/... aan het begin is optioneel)
 * - accent: gelijk op de accenten na (telt als goed, met een opmerking)
 * - almost: één tikfout (telt als fout, met een vriendelijke opmerking)
 */
export function matchText(
  input: string,
  answers: string[],
  strictSubject = false,
): { status: Status; best: string } {
  const inN = norm(input);
  if (!inN) return { status: 'wrong', best: answers[0] };
  const prep = (s: string) => (strictSubject ? s : dropSubject(s));

  let accent: string | null = null;
  let almost: string | null = null;

  for (const ans of answers) {
    const aN = norm(ans);
    if (inN === aN || prep(inN) === prep(aN)) return { status: 'correct', best: ans };
    const inF = fold(prep(inN));
    const aF = fold(prep(aN));
    if (inF === aF) accent = accent ?? ans;
    else if (aF.length >= 4 && distance(inF, aF) <= 1) almost = almost ?? ans;
  }
  if (accent) return { status: 'accent', best: accent };
  if (almost) return { status: 'almost', best: almost };
  return { status: 'wrong', best: answers[0] };
}

export function findWrongFeedback(input: string, patterns?: WrongPattern[]): string | undefined {
  if (!patterns || !patterns.length) return undefined;
  const f = fold(norm(input));
  for (const p of patterns) {
    const m = fold(norm(p.match));
    if (m && f.includes(m)) return p.feedback;
  }
  return undefined;
}

/** Het antwoord dat we laten zien als voorbeeld ("modelantwoord"). */
export function primaryAnswer(ex: Exercise): string {
  switch (ex.type) {
    case 'choice':
      return ex.options[ex.answer];
    case 'fill':
      return fillSentence(ex.sentence, ex.answers[0]);
    case 'build':
      return ex.answers[0];
    case 'write':
      return ex.answers[0];
    case 'listen':
      return ex.mode === 'choose' ? (ex.options ?? [])[ex.answer ?? 0] : (ex.answers ?? [ex.es])[0];
  }
}

export function checkExercise(ex: Exercise, a: Answer): Verdict {
  if (ex.type === 'choice' || (ex.type === 'listen' && ex.mode === 'choose')) {
    const idx = ex.type === 'choice' ? ex.answer : ex.answer ?? 0;
    const ok = a.choice === idx;
    return {
      correct: ok,
      status: ok ? 'correct' : 'wrong',
      expected: primaryAnswer(ex),
    };
  }

  const input = a.text ?? '';
  let answers: string[];
  if (ex.type === 'fill') answers = ex.answers;
  else if (ex.type === 'listen') answers = ex.answers && ex.answers.length ? ex.answers : [ex.es];
  else answers = (ex as { answers: string[] }).answers;

  const strict = !!ex.strictSubject;
  const { status, best } = matchText(input, answers, strict);
  const correct = status === 'correct' || status === 'accent';
  const expected = ex.type === 'fill' ? fillSentence(ex.sentence, best) : best;
  const verdict: Verdict = { correct, status, expected };
  if (!correct) verdict.feedback = findWrongFeedback(input, ex.wrong);
  return verdict;
}

/** Instructie per oefenvorm, afhankelijk van de taalinstelling van het niveau. */
export function instructionFor(ex: Exercise): { nl: string; es: string } {
  switch (ex.type) {
    case 'choice':
      return { nl: 'Kies het juiste antwoord', es: 'Elige la respuesta correcta' };
    case 'fill':
      return { nl: 'Vul het ontbrekende woord in', es: 'Completa la frase' };
    case 'build':
      return { nl: 'Zet de woorden in de juiste volgorde', es: 'Ordena las palabras' };
    case 'listen':
      return ex.mode === 'choose'
        ? { nl: 'Luister en kies wat je hoort', es: 'Escucha y elige' }
        : { nl: 'Luister en typ wat je hoort', es: 'Escucha y escribe' };
    case 'write':
      return { nl: 'Schrijf dit in het Spaans', es: 'Escribe en español' };
  }
}
