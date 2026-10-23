// Controleert dat elke oefening zijn eigen modelantwoorden goedkeurt en dat foutpatronen niet per ongeluk
// een goed antwoord afkeuren. Gebruik: tsx scripts/check-answers.ts [bestand ...]
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkExercise, findWrongFeedback } from '../src/engine/check';
import { fillSentence } from '../src/engine/text';
import type { Exercise, Level } from '../src/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src', 'content', 'levels');
let files = process.argv.slice(2);
if (!files.length) {
  files = readdirSync(dir)
    .filter((f) => /^level\d+\.json$/.test(f))
    .sort()
    .map((f) => join(dir, f));
}

const problems: string[] = [];
let checked = 0;

function all(lv: Level): { where: string; ex: Exercise }[] {
  const out: { where: string; ex: Exercise }[] = [];
  for (const l of lv.lessons) {
    const w = `${basename(String(lv.id))} ${l.id} "${l.title}"`;
    for (const ex of l.quiz ?? []) out.push({ where: w, ex });
    for (const ex of l.exercises ?? []) out.push({ where: w, ex });
    if (l.dialogue) for (const t of l.dialogue.turns) if (t.who === 'you') out.push({ where: w, ex: t.ex });
  }
  return out;
}

for (const f of files) {
  const lv = JSON.parse(readFileSync(f, 'utf8')) as Level;
  for (const { where, ex } of all(lv)) {
    checked++;
    const at = `${where} ${ex.id}`;
    const fail = (msg: string) => problems.push(`${at}: ${msg}`);

    if (ex.type === 'choice') {
      if (!checkExercise(ex, { choice: ex.answer }).correct) fail('juiste optie wordt afgekeurd');
      continue;
    }
    if (ex.type === 'listen' && ex.mode === 'choose') {
      if (!checkExercise(ex, { choice: ex.answer ?? 0 }).correct) fail('juiste optie wordt afgekeurd');
      continue;
    }

    const answers: string[] =
      ex.type === 'listen' ? (ex.answers && ex.answers.length ? ex.answers : [ex.es]) : (ex as { answers: string[] }).answers;
    const seen = new Set<string>();
    for (const a of answers) {
      const v = checkExercise(ex, { text: a });
      if (!v.correct) fail(`eigen antwoord "${a}" wordt afgekeurd (status ${v.status})`);
      if (seen.has(a.trim().toLowerCase())) fail(`dubbel antwoord "${a}"`);
      seen.add(a.trim().toLowerCase());
      const full = ex.type === 'fill' ? fillSentence(ex.sentence, a) : a;
      if (/\s{2,}/.test(full) || /\s[,.;:?!]/.test(full)) fail(`vreemde spaties in "${full}"`);
      if (ex.wrong) {
        const fb = findWrongFeedback(a, ex.wrong);
        if (fb) fail(`een foutpatroon (wrong) past ook op het goede antwoord "${a}"`);
      }
    }
  }
}

console.log(`${checked} oefeningen gecontroleerd in ${files.length} niveau(s).`);
if (problems.length) {
  console.log(`\n${problems.length} PROBLEEM(EN):\n` + problems.slice(0, 150).map((p) => ' x ' + p).join('\n'));
  process.exit(1);
}
console.log('Alle modelantwoorden worden goedgekeurd.');
