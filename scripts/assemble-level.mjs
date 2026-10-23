// Voegt de brondelen van één niveau samen tot src/content/levels/levelNN.json en zet de id's goed.
//
// Brondelen (per niveau NN):
//   content-src/levelNN/meta.json         alles van het niveau behalve "lessons"
//   content-src/levelNN/lesson-01.json    één les per bestand (lesson-01 t/m lesson-10)
//
// Gebruik: node scripts/assemble-level.mjs 3      (of: 03)
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

for (const arg of process.argv.slice(2)) {
  const n = Number(arg);
  if (!Number.isInteger(n) || n < 1) {
    console.error(`Ongeldig niveaunummer: ${arg}`);
    process.exitCode = 1;
    continue;
  }
  const nn = String(n).padStart(2, '0');
  const dir = join(root, 'content-src', `level${nn}`);
  if (!existsSync(join(dir, 'meta.json'))) {
    console.error(`${dir}/meta.json ontbreekt`);
    process.exitCode = 1;
    continue;
  }
  const parse = (f) => {
    try {
      return JSON.parse(readFileSync(join(dir, f), 'utf8'));
    } catch (e) {
      throw new Error(`${f}: ongeldige JSON (${e.message})`);
    }
  };
  const meta = parse('meta.json');
  const lessonFiles = readdirSync(dir)
    .filter((f) => /^lesson-\d+\.json$/.test(f))
    .sort();
  const lv = { ...meta, n, id: `L${nn}`, lessons: lessonFiles.map(parse) };

  lv.lessons.forEach((l, i) => {
    l.id = `${lv.id}-${String(i + 1).padStart(2, '0')}`;
    let c = 0;
    const tag = (ex, letter) => {
      c += 1;
      ex.id = `${l.id}-${letter}${c}`;
    };
    (l.quiz || []).forEach((e) => tag(e, 'q'));
    (l.exercises || []).forEach((e) => tag(e, 'e'));
    if (l.dialogue) for (const t of l.dialogue.turns || []) if (t.who === 'you' && t.ex) tag(t.ex, 't');
  });

  // Vaste volgorde van de sleutels, zodat het bestand leesbaar blijft.
  const ordered = {
    n: lv.n,
    id: lv.id,
    title: lv.title,
    subtitle: lv.subtitle,
    emoji: lv.emoji,
    instructionLang: lv.instructionLang,
    goals: lv.goals,
    badge: lv.badge,
    lessons: lv.lessons,
  };
  writeFileSync(join(root, 'src', 'content', 'levels', `level${nn}.json`), JSON.stringify(ordered, null, 1) + '\n');
  console.log(`level${nn}.json geschreven: ${lv.lessons.length} lessen uit ${lessonFiles.length} bestanden.`);
}
