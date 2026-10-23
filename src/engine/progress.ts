// Voortgang, XP, reeks, ontgrendelen en badges. Geen React of RN hierin, zodat het testbaar is.
import type { Exercise, Level, Lesson, Progress, Settings } from '../types';

export const DEFAULT_SETTINGS: Settings = {
  rate: 'normaal',
  autoplay: true,
  listenMode: false,
  unlockAll: false,
};

export function initialProgress(): Progress {
  return {
    version: 1,
    xp: 0,
    streak: { count: 0, best: 0, lastDay: '' },
    lessons: {},
    mistakes: {},
    stats: { correct: 0, total: 0, byType: {}, reviewed: 0, policeDialogues: 0 },
    badges: {},
    settings: { ...DEFAULT_SETTINGS },
    onboardingDone: false,
  };
}

/** Voegt opgeslagen voortgang samen met de standaardwaarden (voor oudere opslagversies). */
export function hydrate(raw: any): Progress {
  const base = initialProgress();
  if (!raw || typeof raw !== 'object') return base;
  return {
    ...base,
    ...raw,
    streak: { ...base.streak, ...(raw.streak || {}) },
    stats: { ...base.stats, ...(raw.stats || {}) },
    settings: { ...base.settings, ...(raw.settings || {}) },
    lessons: raw.lessons || {},
    mistakes: raw.mistakes || {},
    badges: raw.badges || {},
  };
}

// ---------- Datum en reeks ----------

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

export function touchStreak(p: Progress, today: string): Progress {
  const s = p.streak;
  if (s.lastDay === today) return p;
  const gap = s.lastDay ? daysBetween(s.lastDay, today) : 99;
  const count = gap === 1 ? s.count + 1 : 1;
  return { ...p, streak: { count, best: Math.max(s.best, count), lastDay: today } };
}

/** Reeks zoals hij nu getoond wordt: na een gemiste dag staat hij op 0. */
export function currentStreak(p: Progress, today: string): number {
  if (!p.streak.lastDay) return 0;
  const gap = daysBetween(p.streak.lastDay, today);
  return gap <= 1 ? p.streak.count : 0;
}

// ---------- Antwoorden en sessies ----------

export type SessionKind = 'learn' | 'practice' | 'dialogue' | 'test' | 'review' | 'mix' | 'retry';

export type AnswerEvent = {
  ex: Exercise;
  correct: boolean;
  firstTry: boolean;
  mode: SessionKind;
};

export function typeKey(ex: Exercise): string {
  return ex.type;
}

export function applyAnswer(p: Progress, ev: AnswerEvent, now = Date.now()): Progress {
  const stats = { ...p.stats, byType: { ...p.stats.byType } };
  if (ev.firstTry) {
    stats.total += 1;
    if (ev.correct) stats.correct += 1;
    const k = typeKey(ev.ex);
    const cur = stats.byType[k] || { c: 0, t: 0 };
    stats.byType[k] = { c: cur.c + (ev.correct ? 1 : 0), t: cur.t + 1 };
  }
  const mistakes = { ...p.mistakes };
  const isReview = ev.mode === 'review' || ev.mode === 'retry';
  if (!ev.correct && ev.firstTry) {
    const cur = mistakes[ev.ex.id];
    mistakes[ev.ex.id] = { n: (cur?.n ?? 0) + 1, ok: 0, last: now };
  } else if (ev.correct && isReview && mistakes[ev.ex.id]) {
    const cur = mistakes[ev.ex.id];
    if (cur.ok + 1 >= 2) {
      delete mistakes[ev.ex.id];
      stats.reviewed += 1;
    } else {
      mistakes[ev.ex.id] = { ...cur, ok: cur.ok + 1, last: now };
    }
  }
  return touchStreak({ ...p, stats, mistakes }, dayKey(new Date(now)));
}

export type SessionItem = { ex: Exercise; first: boolean; hint: boolean };

export type Summary = {
  kind: SessionKind;
  lessonId?: string;
  title: string;
  total: number;
  firstCorrect: number;
  hintsUsed: number;
  mistakes: Exercise[];
  xp: number;
  pct: number;
  stars: number;
  passed: boolean;
};

const BASE_XP: Record<string, number> = { choice: 8, listen: 9, fill: 10, build: 10, write: 15 };

export function summarize(
  kind: SessionKind,
  title: string,
  items: SessionItem[],
  lessonId?: string,
): Summary {
  const total = items.length;
  const firstCorrect = items.filter((i) => i.first).length;
  let xp = 0;
  for (const i of items) {
    if (i.first) xp += Math.round((BASE_XP[i.ex.type] ?? 8) * (i.hint ? 0.5 : 1));
    else xp += 2;
  }
  const pct = total ? Math.round((firstCorrect / total) * 100) : 100;
  const passed = kind === 'test' ? pct >= 80 : true;
  let stars = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
  if (kind === 'test' && !passed) stars = 0;
  if (kind === 'learn' || kind === 'practice' || kind === 'dialogue') xp += 10;
  if (kind === 'test' && passed) xp += 30;
  return {
    kind,
    lessonId,
    title,
    total,
    firstCorrect,
    hintsUsed: items.filter((i) => i.hint).length,
    mistakes: items.filter((i) => !i.first).map((i) => i.ex),
    xp,
    pct,
    stars,
    passed,
  };
}

// ---------- Lessen, niveaus, ontgrendelen ----------

export function lessonDone(p: Progress, id: string): boolean {
  return (p.lessons[id]?.done ?? 0) > 0;
}

export function levelDoneCount(p: Progress, level: Level): number {
  return level.lessons.filter((l) => lessonDone(p, l.id)).length;
}

export function levelDone(p: Progress, level: Level): boolean {
  return level.lessons.length > 0 && levelDoneCount(p, level) === level.lessons.length;
}

export function isUnlocked(p: Progress, levels: Level[], li: number, si: number): boolean {
  if (p.settings.unlockAll) return true;
  if (si > 0) return lessonDone(p, levels[li].lessons[si - 1].id);
  if (li === 0) return true;
  return levelDone(p, levels[li - 1]);
}

/** De eerstvolgende les in het vaste pad die nog niet gedaan is. */
export function nextLesson(
  p: Progress,
  levels: Level[],
): { level: Level; lesson: Lesson; li: number; si: number } | null {
  for (let li = 0; li < levels.length; li++) {
    for (let si = 0; si < levels[li].lessons.length; si++) {
      const lesson = levels[li].lessons[si];
      if (!lessonDone(p, lesson.id)) return { level: levels[li], lesson, li, si };
    }
  }
  return null;
}

export function applySession(
  p: Progress,
  s: Summary,
  levels: Level[],
  now = Date.now(),
): { progress: Progress; newBadges: BadgeDef[] } {
  let next: Progress = { ...p, xp: p.xp + s.xp };
  if (s.lessonId && s.passed) {
    const prev = next.lessons[s.lessonId];
    next = {
      ...next,
      lessons: {
        ...next.lessons,
        [s.lessonId]: {
          done: (prev?.done ?? 0) + 1,
          stars: Math.max(prev?.stars ?? 0, s.stars),
          best: Math.max(prev?.best ?? 0, s.pct),
          last: now,
        },
      },
    };
  }
  next = touchStreak(next, dayKey(new Date(now)));
  const defs = badgeDefs(levels);
  const earned: BadgeDef[] = [];
  const badges = { ...next.badges };
  // Twee rondes, want een badge kan (door XP-bonus) een volgende vrijspelen.
  for (const d of defs) {
    if (!badges[d.id] && d.test(next, levels)) {
      badges[d.id] = dayKey(new Date(now));
      earned.push(d);
    }
  }
  next = { ...next, badges };
  return { progress: next, newBadges: earned };
}

// ---------- Badges ----------

export type BadgeDef = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  test: (p: Progress, levels: Level[]) => boolean;
};

function countDone(p: Progress, levels: Level[], pred: (l: Lesson) => boolean): number {
  let n = 0;
  for (const lv of levels) for (const l of lv.lessons) if (pred(l) && lessonDone(p, l.id)) n++;
  return n;
}

export function badgeDefs(levels: Level[]): BadgeDef[] {
  const defs: BadgeDef[] = [
    {
      id: 'first-lesson',
      emoji: '👣',
      name: 'Eerste stap',
      desc: 'Rond je eerste les af.',
      test: (p) => Object.keys(p.lessons).length >= 1,
    },
    {
      id: 'first-dialogue',
      emoji: '💬',
      name: 'Eerste gesprek',
      desc: 'Voer je eerste gesprek in het Spaans.',
      test: (p, lv) => countDone(p, lv, (l) => l.kind === 'dialogue') >= 1,
    },
    {
      id: 'first-test',
      emoji: '📝',
      name: 'Toets gehaald',
      desc: 'Haal een niveautoets.',
      test: (p, lv) => countDone(p, lv, (l) => l.kind === 'test') >= 1,
    },
    {
      id: 'dialogues-10',
      emoji: '🗣️',
      name: 'Prater',
      desc: 'Rond 10 gesprekken af.',
      test: (p, lv) => countDone(p, lv, (l) => l.kind === 'dialogue') >= 10,
    },
    {
      id: 'police-3',
      emoji: '👮',
      name: 'Agente de policía',
      desc: 'Rond 3 gesprekken uit het politiewerk af.',
      test: (p, lv) =>
        countDone(p, lv, (l) => l.kind === 'dialogue' && !!l.dialogue?.tags?.includes('politie')) >= 3,
    },
    {
      id: 'police-10',
      emoji: '🚔',
      name: 'Comisario',
      desc: 'Rond 10 gesprekken uit het politiewerk af.',
      test: (p, lv) =>
        countDone(p, lv, (l) => l.kind === 'dialogue' && !!l.dialogue?.tags?.includes('politie')) >= 10,
    },
    {
      id: 'perfect',
      emoji: '💯',
      name: 'Foutloos',
      desc: 'Rond een les af zonder één fout.',
      test: (p) => Object.values(p.lessons).some((l) => l.best >= 100),
    },
    {
      id: 'perfect-10',
      emoji: '🌟',
      name: 'Perfectionist',
      desc: 'Rond 10 lessen af met drie sterren.',
      test: (p) => Object.values(p.lessons).filter((l) => l.stars >= 3).length >= 10,
    },
    {
      id: 'streak-3',
      emoji: '🔥',
      name: 'Drie dagen op rij',
      desc: 'Oefen drie dagen achter elkaar.',
      test: (p) => p.streak.best >= 3,
    },
    {
      id: 'streak-7',
      emoji: '📅',
      name: 'Een hele week',
      desc: 'Oefen zeven dagen achter elkaar.',
      test: (p) => p.streak.best >= 7,
    },
    {
      id: 'streak-30',
      emoji: '🏔️',
      name: 'Een maand volgehouden',
      desc: 'Oefen dertig dagen achter elkaar.',
      test: (p) => p.streak.best >= 30,
    },
    { id: 'xp-100', emoji: '⭐', name: '100 XP', desc: 'Verdien 100 XP.', test: (p) => p.xp >= 100 },
    { id: 'xp-500', emoji: '✨', name: '500 XP', desc: 'Verdien 500 XP.', test: (p) => p.xp >= 500 },
    { id: 'xp-2000', emoji: '🚀', name: '2000 XP', desc: 'Verdien 2000 XP.', test: (p) => p.xp >= 2000 },
    {
      id: 'writer-50',
      emoji: '✍️',
      name: 'Schrijver',
      desc: 'Schrijf 50 zinnen goed.',
      test: (p) => (p.stats.byType.write?.c ?? 0) >= 50,
    },
    {
      id: 'listener-30',
      emoji: '👂',
      name: 'Luisteraar',
      desc: 'Beantwoord 30 luisteroefeningen goed.',
      test: (p) => (p.stats.byType.listen?.c ?? 0) >= 30,
    },
    {
      id: 'reviewer-20',
      emoji: '🎯',
      name: 'Foutenjager',
      desc: 'Werk 20 eerdere fouten weg.',
      test: (p) => p.stats.reviewed >= 20,
    },
  ];
  for (const lv of levels) {
    defs.push({
      id: `level-${lv.n}`,
      emoji: lv.badge.emoji,
      name: lv.badge.name,
      desc: lv.badge.desc,
      test: (p) => levelDone(p, lv),
    });
  }
  defs.push({
    id: 'graduado',
    emoji: '🎓',
    name: 'Graduado',
    desc: 'Rond het hele traject af.',
    test: (p, lv) => lv.length > 0 && lv.every((l) => levelDone(p, l)),
  });
  return defs;
}
