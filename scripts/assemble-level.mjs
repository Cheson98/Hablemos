// Voegt de brondelen van één niveau samen tot src/content/levels/levelNN.json.
//
// Bronmap:  content-src/levelNN/meta.json           (niveau-velden zonder "lessons")
//           content-src/levelNN/lesson-01.json ...  (één bestand per les, in volgorde)
// Gebruik:  node scripts/assemble-level.mjs 3        (of: 03)
// Daarna worden de id's automatisch gezet (zoals scripts/fix-ids.mjs).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv[2];
if (!arg || !/^\d+$/.test(arg)) {
  console.error('Gebruik: node scripts/assemble-level.mjs <niveaunummer>');
  process.exit(2);
}
const n = Number(arg);
const nn = String(n).padStart(2, '0');
const srcDir = join(root, 'content-src', `level${nn}`);
if (!existsSync(srcDir)) {
  console.error(`Bronmap ontbreekt: ${srcDir}`);
  process.exit(2);
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`Ongeldige JSON in ${file}: ${e.message}`);
    process.exit(1);
  }
}

const meta = readJson(join(srcDir, 'meta.json'));
const lessonFiles = readdirSync(srcDir)
  .filter((f) => /^lesson-\d+\.json$/.test(f))
  .sort();
if (!lessonFiles.length) {
  console.error('Geen lesbestanden gevonden (lesson-01.json, ...).');
  process.exit(1);
}

const lv = { ...meta, n, id: `L${nn}`, lessons: lessonFiles.map((f) => readJson(join(srcDir, f))) };

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

const outDir = join(root, 'src', 'content', 'levels');
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `level${nn}.json`);
writeFileSync(out, JSON.stringify(lv, null, 2) + '\n');
console.log(`${out}: ${lv.lessons.length} lessen samengevoegd, id's gezet.`);
