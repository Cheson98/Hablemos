// Tekst-hulpfuncties: normaliseren, accenten, afstand tussen woorden, opmaak.

const PRONOUNS = new Set([
  'yo', 'tú', 'él', 'ella', 'usted', 'nosotros', 'nosotras', 'vosotros', 'vosotras', 'ellos', 'ellas', 'ustedes',
]);

/** Kleine letters, zonder leestekens en dubbele spaties. Accenten blijven staan. */
export function norm(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’'`´]/g, '')
    .replace(/[¿¡?!.,;:"“”«»()\[\]…–—\-/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Haalt accenten weg, maar laat de ñ intact (año is iets anders dan ano). */
export function fold(s: string): string {
  return s
    .replace(/ñ/g, '\u0001')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\u0001/g, 'ñ')
    .normalize('NFC');
}

/** Verwijdert een onderwerpswoord aan het begin (yo hablo -> hablo). Werkt op genormaliseerde tekst. */
export function dropSubject(n: string): string {
  const i = n.indexOf(' ');
  if (i < 0) return n;
  const first = n.slice(0, i);
  return PRONOUNS.has(first) ? n.slice(i + 1) : n;
}

/** Damerau-Levenshtein-afstand (met omwisseling van naastliggende letters). */
export function distance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (!al) return bl;
  if (!bl) return al;
  const d: number[][] = [];
  for (let i = 0; i <= al; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= bl; j++) d[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[al][bl];
}

/** Eenvoudige opmaak: **vet** en regelafbrekingen. */
export type Seg = { t: string; b: boolean };
export function parseRich(text: string): Seg[] {
  const out: Seg[] = [];
  const parts = text.split('**');
  parts.forEach((p, i) => {
    if (p) out.push({ t: p, b: i % 2 === 1 });
  });
  return out;
}

/** Vervangt ___ door het gegeven antwoord. */
export function fillSentence(sentence: string, answer: string): string {
  return sentence.replace('___', answer);
}

/** Maakt tekst geschikt om voor te lezen: geen opmaak en geen invulstreepjes. */
export function speakable(text: string): string {
  return text.replace(/\*\*/g, '').replace(/___/g, '...').replace(/\s+/g, ' ').trim();
}

/** Deterministische pseudo-willekeur, zodat de woordenvolgorde per oefening stabiel is. */
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededShuffle<T>(arr: T[], seed: string): T[] {
  const a = arr.slice();
  let s = hashStr(seed) || 1;
  const rnd = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickRandom<T>(arr: T[], n: number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}
