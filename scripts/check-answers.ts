// Controleert of de antwoordcontrole van de app elk bedoeld antwoord in de lessen accepteert,
// en let op Spaanse leestekens. Gebruik: npx tsx scripts/check-answers.ts [bestand ...]
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkExercise } from '../src/engine/check';
import { norm } from '../src/engine/text';
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

const errors: string[] = [];
const warns: string[] = [];

function punct(where: string, field: string, s: string) {
  const q = (s.match(/\?/g) || []).length;
  const iq = (s.match(/¿/g) || []).length;
  const e = (s.match(/!/g) || []).length;
  const ie = (s.match(/¡/g) || []).length;
  if (q !== iq) errors.push(`${where}: ${field} heeft ${iq}× ¿ maar ${q}× ? ("${s}")`);
  if (e !== ie) errors.push(`${where}: ${field} heeft ${ie}× ¡ maar ${e}× ! ("${s}")`);
}

function checkEx(where: string, ex: Exercise) {
  const label = `${where} [${ex.id}]`;
  switch (ex.type) {
    case 'choice': {
      if ((ex.optionsLang ?? 'es') === 'es') ex.options.forEach((o, i) => punct(label, `options[${i}]`, o));
      if (ex.promptLang === 'es') punct(label, 'prompt', ex.prompt);
      const seen = new Set(ex.options.map((o) => norm(o)));
      if (seen.size !== ex.options.length) errors.push(`${label}: twee opties zijn na normaliseren gelijk`);
      break;
    }
    case 'fill': {
      ex.answers.forEach((a, i) => {
        const v = checkExercise(ex, { text: a });
        if (!v.correct || v.status !== 'correct') errors.push(`${label}: answers[${i}] "${a}" wordt niet als goed gezien (${v.status})`);
      });
      punct(label, 'sentence', ex.sentence.replace('___', ex.answers[0]));
      break;
    }
    case 'build': {
      ex.answers.forEach((a, i) => {
        const v = checkExercise(ex, { text: a });
        if (!v.correct || v.status !== 'correct') errors.push(`${label}: answers[${i}] "${a}" wordt niet als goed gezien (${v.status})`);
        punct(label, `answers[${i}]`, a);
      });
      break;
    }
    case 'write': {
      ex.answers.forEach((a, i) => {
        const v = checkExercise(ex, { text: a });
        if (!v.correct || v.status !== 'correct') errors.push(`${label}: answers[${i}] "${a}" wordt niet als goed gezien (${v.status})`);
        punct(label, `answers[${i}]`, a);
      });
      break;
    }
    case 'listen': {
      punct(label, 'es', ex.es);
      if (ex.mode === 'type') {
        const answers = ex.answers && ex.answers.length ? ex.answers : [ex.es];
        answers.forEach((a, i) => {
          const v = checkExercise(ex, { text: a });
          if (!v.correct || v.status !== 'correct') errors.push(`${label}: answers[${i}] "${a}" wordt niet als goed gezien (${v.status})`);
        });
      } else {
        (ex.options ?? []).forEach((o, i) => punct(label, `options[${i}]`, o));
      }
      break;
    }
  }
  if (ex.wrong) {
    for (const w of ex.wrong) {
      if (!norm(w.match)) errors.push(`${label}: wrong.match is leeg na normaliseren`);
    }
  }
  if (ex.type === 'choice') return;
  // Een foutpatroon mag een goed antwoord niet kapen: controle gebeurt al in de app (alleen bij fout), dus alleen waarschuwen.
}

for (const file of files) {
  const lv = JSON.parse(readFileSync(file, 'utf8')) as Level;
  const name = basename(file);
  let count = 0;
  for (const l of lv.lessons) {
    const where = `${name} ${l.id} "${l.title}"`;
    const list: Exercise[] = [];
    if (l.kind === 'learn') list.push(...(l.quiz ?? []));
    else if (l.kind === 'dialogue' && l.dialogue) {
      for (const t of l.dialogue.turns) {
        if (t.who === 'npc') punct(where, 'npc.es', t.es);
        else list.push(t.ex);
      }
    } else list.push(...(l.exercises ?? []));
    for (const c of l.cards ?? []) {
      if (c.kind === 'examples') c.items.forEach((it, i) => punct(where, `kaart items[${i}].es`, it.es));
    }
    for (const ex of list) {
      checkEx(where, ex);
      count++;
    }
  }
  console.log(`${name}: ${count} oefeningen gecontroleerd.`);
}

if (warns.length) console.log(`\n${warns.length} waarschuwing(en):\n` + warns.map((w) => ' - ' + w).join('\n'));
if (errors.length) {
  console.log(`\n${errors.length} FOUT(EN):\n` + errors.slice(0, 150).map((e) => ' x ' + e).join('\n') + (errors.length > 150 ? `\n ... en nog ${errors.length - 150}` : ''));
  process.exit(1);
}
console.log('\nAlle antwoorden worden door de app geaccepteerd.');
