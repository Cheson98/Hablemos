// Controleert de lesinhoud op structuur en veelgemaakte fouten.
// Gebruik: node scripts/validate-content.mjs [bestand ...]   (zonder bestanden: alle niveaus)
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src', 'content', 'levels');
let files = process.argv.slice(2);
if (!files.length) {
  files = readdirSync(dir)
    .filter((f) => /^level\d+\.json$/.test(f))
    .sort()
    .map((f) => join(dir, f));
}

const errors = [];
const warns = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warns.push(`${where}: ${msg}`);
const seenIds = new Map();

const str = (v) => typeof v === 'string' && v.trim().length > 0;
const arr = (v) => Array.isArray(v);

const LATAM = ['celular', 'carro', 'jugo', 'computadora', 'platicar', 'parqueadero', 'chévere', 'ahorita', 'boleto', 'plata', 'manejar', 'lindo', 'pibe', 'vos '];

function checkText(where, field, s, { es = false } = {}) {
  if (!str(s)) return err(where, `${field} ontbreekt of is leeg`);
  if (s !== s.trim()) warn(where, `${field} heeft spaties aan begin of eind: "${s}"`);
  if (/ {2,}/.test(s)) warn(where, `${field} heeft dubbele spaties: "${s}"`);
  if (/<[a-z/][^>]*>/i.test(s)) err(where, `${field} bevat HTML: "${s}"`);
  if (es) {
    const low = ' ' + s.toLowerCase() + ' ';
    for (const w of LATAM) if (low.includes(w.includes(' ') ? w : ` ${w}`)) warn(where, `${field} bevat mogelijk Latijns-Amerikaans woord "${w.trim()}": "${s}"`);
  }
}

function checkTags(where, s) {
  const n = (s.match(/\*\*/g) || []).length;
  if (n % 2 !== 0) err(where, `oneven aantal ** in "${s}"`);
}

function checkId(where, id, pattern, lessonId) {
  if (!pattern.test(id || '')) err(where, `id "${id}" heeft niet het juiste formaat (draai scripts/fix-ids.mjs)`);
  if (seenIds.has(id)) err(where, `id "${id}" komt dubbel voor (ook in ${seenIds.get(id)})`);
  seenIds.set(id, where);
}

function checkExercise(where, ex, { inDialogue = false, lessonId = '' } = {}) {
  if (!ex || typeof ex !== 'object') return err(where, 'oefening ontbreekt');
  checkId(where, ex.id, /^L\d{2}-\d{2}-[eqt]\d+$/, lessonId);
  for (const f of ['hint', 'explain', 'nl']) if (ex[f] !== undefined) { checkText(where, f, ex[f]); checkTags(where, ex[f]); }
  if (ex.wrong !== undefined) {
    if (!arr(ex.wrong)) err(where, 'wrong moet een lijst zijn');
    else ex.wrong.forEach((w, i) => { if (!str(w.match) || !str(w.feedback)) err(where, `wrong[${i}] mist match of feedback`); });
  }
  switch (ex.type) {
    case 'choice': {
      checkText(where, 'prompt', ex.prompt);
      if (!arr(ex.options) || ex.options.length < 2 || ex.options.length > 5) return err(where, 'choice: 2 tot 5 opties nodig');
      ex.options.forEach((o, i) => checkText(where, `options[${i}]`, o, { es: (ex.optionsLang ?? 'es') === 'es' }));
      if (new Set(ex.options.map((o) => o.trim().toLowerCase())).size !== ex.options.length) err(where, 'choice: dubbele opties');
      if (!Number.isInteger(ex.answer) || ex.answer < 0 || ex.answer >= ex.options.length) err(where, 'choice: answer is geen geldige index');
      if (ex.optionsNl && (!arr(ex.optionsNl) || ex.optionsNl.length !== ex.options.length)) err(where, 'choice: optionsNl moet even lang zijn als options');
      if (ex.optionsLang && !['nl', 'es'].includes(ex.optionsLang)) err(where, 'choice: optionsLang moet nl of es zijn');
      if (ex.promptLang && !['nl', 'es'].includes(ex.promptLang)) err(where, 'choice: promptLang moet nl of es zijn');
      if ((ex.optionsLang ?? 'es') === 'es' && !ex.optionsNl && inDialogue) warn(where, 'choice in gesprek zonder optionsNl (vertaalknop werkt dan niet)');
      break;
    }
    case 'fill': {
      checkText(where, 'sentence', ex.sentence, { es: true });
      const blanks = (ex.sentence || '').split('___').length - 1;
      if (blanks !== 1) err(where, `fill: sentence moet precies één ___ bevatten (nu ${blanks})`);
      if (!arr(ex.answers) || !ex.answers.length) return err(where, 'fill: answers ontbreekt');
      ex.answers.forEach((a, i) => { checkText(where, `answers[${i}]`, a, { es: true }); if (a.includes('___')) err(where, 'fill: answer bevat ___'); });
      if (!ex.hint && !ex.base) warn(where, 'fill zonder hint of base');
      if (!ex.nl) warn(where, 'fill zonder nl (vertaling)');
      break;
    }
    case 'build': {
      checkText(where, 'prompt', ex.prompt);
      if (!arr(ex.words) || ex.words.length < 2 || ex.words.length > 12) return err(where, 'build: 2 tot 12 woorden');
      if (!arr(ex.answers) || !ex.answers.length) return err(where, 'build: answers ontbreekt');
      ex.words.forEach((w, i) => { if (!str(w) || /\s/.test(w.trim())) err(where, `build: words[${i}] moet één woord zijn: "${w}"`); });
      ex.answers.forEach((a, i) => checkText(where, `answers[${i}]`, a, { es: true }));
      for (const [ai, a] of ex.answers.entries()) {
        const need = a.split(/\s+/);
        const pool = [...ex.words];
        for (const t of need) {
          const k = pool.indexOf(t);
          if (k < 0) { err(where, `build: antwoord ${ai} heeft woord "${t}" dat niet in words staat`); break; }
          pool.splice(k, 1);
        }
        if (ai === 0 && pool.length > 3) warn(where, `build: ${pool.length} afleiders (maximaal 3 aanbevolen)`);
      }
      break;
    }
    case 'listen': {
      checkText(where, 'es', ex.es, { es: true });
      if (!['choose', 'type'].includes(ex.mode)) return err(where, 'listen: mode moet choose of type zijn');
      if (ex.mode === 'choose') {
        if (!arr(ex.options) || ex.options.length < 2) return err(where, 'listen/choose: opties nodig');
        ex.options.forEach((o, i) => checkText(where, `options[${i}]`, o));
        if (!Number.isInteger(ex.answer) || ex.answer < 0 || ex.answer >= ex.options.length) err(where, 'listen/choose: answer is geen geldige index');
      } else if (ex.answers !== undefined && (!arr(ex.answers) || !ex.answers.length)) err(where, 'listen/type: answers moet een niet-lege lijst zijn');
      if (inDialogue) err(where, 'listen is niet toegestaan in een gesprek');
      if (!ex.nl) warn(where, 'listen zonder nl');
      break;
    }
    case 'write': {
      checkText(where, 'prompt', ex.prompt);
      if (!arr(ex.answers) || !ex.answers.length) return err(where, 'write: answers ontbreekt');
      ex.answers.forEach((a, i) => checkText(where, `answers[${i}]`, a, { es: true }));
      if (!ex.hint) warn(where, 'write zonder hint');
      break;
    }
    default:
      err(where, `onbekend type "${ex.type}"`);
  }
  if (ex.type !== 'choice' && ex.type !== 'listen') {
    if (ex.optionsNl || ex.optionsLang) warn(where, 'optionsNl/optionsLang horen alleen bij choice');
  }
}

function checkCard(where, c) {
  if (!c || typeof c !== 'object') return err(where, 'kaart ontbreekt');
  for (const f of ['title', 'intro', 'body', 'note']) if (c[f] !== undefined) { checkText(where, f, c[f]); checkTags(where, c[f]); }
  switch (c.kind) {
    case 'text': if (!str(c.body)) err(where, 'text: body ontbreekt'); break;
    case 'examples':
      if (!arr(c.items) || c.items.length < 2) return err(where, 'examples: minstens 2 items');
      c.items.forEach((it, i) => { checkText(where, `items[${i}].es`, it.es, { es: true }); checkText(where, `items[${i}].nl`, it.nl); });
      break;
    case 'table': {
      if (!arr(c.head) || c.head.length < 2 || c.head.length > 4) return err(where, 'table: head moet 2 tot 4 kolommen hebben');
      if (!arr(c.rows) || !c.rows.length) return err(where, 'table: rows ontbreekt');
      c.rows.forEach((r, i) => { if (!arr(r) || r.length !== c.head.length) err(where, `table: rij ${i} heeft ${arr(r) ? r.length : '?'} cellen, verwacht ${c.head.length}`); else r.forEach((cell) => { if (typeof cell !== 'string') err(where, `table: cel is geen tekst`); else checkTags(where, cell); }); });
      break;
    }
    case 'tip':
      if (!str(c.body)) err(where, 'tip: body ontbreekt');
      if (c.tone && !['tip', 'warn', 'spain', 'police'].includes(c.tone)) err(where, `tip: tone "${c.tone}" onbekend`);
      break;
    default:
      err(where, `onbekend kaarttype "${c.kind}"`);
  }
}

const stats = [];

for (const file of files) {
  const name = basename(file);
  const m = name.match(/^level(\d+)\.json$/);
  let lv;
  try {
    lv = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    err(name, `ongeldige JSON: ${e.message}`);
    continue;
  }
  const n = m ? Number(m[1]) : -1;
  const lid = `L${String(n).padStart(2, '0')}`;
  if (lv.n !== n) err(name, `n is ${lv.n}, verwacht ${n}`);
  if (lv.id !== lid) err(name, `id is "${lv.id}", verwacht "${lid}"`);
  for (const f of ['title', 'subtitle', 'emoji']) checkText(name, f, lv[f]);
  if (!['nl', 'mix', 'es'].includes(lv.instructionLang)) err(name, 'instructionLang moet nl, mix of es zijn');
  if (!arr(lv.goals) || lv.goals.length < 3) err(name, 'goals: minstens 3 doelen');
  else lv.goals.forEach((g, i) => checkText(name, `goals[${i}]`, g));
  if (!lv.badge || !str(lv.badge.name) || !str(lv.badge.emoji) || !str(lv.badge.desc)) err(name, 'badge heeft name, emoji en desc nodig');
  if (!arr(lv.lessons) || lv.lessons.length < 9 || lv.lessons.length > 14) { err(name, `lessons: 9 tot 14 lessen nodig (nu ${arr(lv.lessons) ? lv.lessons.length : '?'})`); continue; }

  const counts = { learn: 0, practice: 0, dialogue: 0, test: 0 };
  const types = {};
  let exTotal = 0;
  let police = 0;
  lv.lessons.forEach((l, li) => {
    const w = `${name} les ${li + 1}${l.title ? ` "${l.title}"` : ''}`;
    checkId(w, l.id, /^L\d{2}-\d{2}$/);
    if (l.id !== `${lid}-${String(li + 1).padStart(2, '0')}`) err(w, `les-id "${l.id}" past niet bij positie (draai scripts/fix-ids.mjs)`);
    checkText(w, 'title', l.title);
    checkText(w, 'emoji', l.emoji);
    if (!['learn', 'practice', 'dialogue', 'test'].includes(l.kind)) return err(w, `onbekend kind "${l.kind}"`);
    counts[l.kind]++;
    const each = (list, opts) => (list || []).forEach((ex, i) => { checkExercise(`${w} oef ${i + 1}`, ex, { ...opts, lessonId: l.id }); types[ex.type] = (types[ex.type] || 0) + 1; exTotal++; });
    if (l.kind === 'learn') {
      if (!arr(l.cards) || l.cards.length < 3 || l.cards.length > 9) err(w, 'learn: 3 tot 9 kaarten nodig');
      else l.cards.forEach((c, i) => checkCard(`${w} kaart ${i + 1}`, c));
      if (!arr(l.quiz) || l.quiz.length < 3 || l.quiz.length > 7) err(w, 'learn: quiz met 3 tot 7 oefeningen nodig');
      else each(l.quiz);
      if (l.exercises || l.dialogue) err(w, 'learn mag geen exercises of dialogue hebben');
    } else if (l.kind === 'practice') {
      if (!arr(l.exercises) || l.exercises.length < 8 || l.exercises.length > 14) err(w, 'practice: 8 tot 14 oefeningen nodig');
      else each(l.exercises);
      if (l.cards || l.quiz || l.dialogue) err(w, 'practice mag alleen exercises hebben');
    } else if (l.kind === 'test') {
      if (!arr(l.exercises) || l.exercises.length < 12 || l.exercises.length > 20) err(w, 'test: 12 tot 20 oefeningen nodig');
      else each(l.exercises);
      if (li !== lv.lessons.length - 1) err(w, 'de toets moet de laatste les zijn');
    } else if (l.kind === 'dialogue') {
      const d = l.dialogue;
      if (!d || typeof d !== 'object') return err(w, 'dialogue ontbreekt');
      checkText(w, 'setting', d.setting);
      if (!['usted', 'tú', 'mixed'].includes(d.formal)) err(w, 'formal moet usted, tú of mixed zijn');
      checkText(w, 'npcName', d.npcName);
      checkText(w, 'npcEmoji', d.npcEmoji);
      if (d.tags && d.tags.includes('politie')) police++;
      if (!arr(d.turns) || d.turns.length < 8 || d.turns.length > 24) return err(w, 'dialogue: 8 tot 24 beurten nodig');
      if (d.turns[0].who !== 'npc') err(w, 'het gesprek moet beginnen met de gesprekspartner (npc)');
      let youCount = 0;
      d.turns.forEach((t, ti) => {
        const tw = `${w} beurt ${ti + 1}`;
        if (t.who === 'npc') {
          checkText(tw, 'es', t.es, { es: true });
          checkText(tw, 'nl', t.nl);
        } else if (t.who === 'you') {
          youCount++;
          checkExercise(tw, t.ex, { inDialogue: true, lessonId: l.id });
          if (t.ex) { types[t.ex.type] = (types[t.ex.type] || 0) + 1; exTotal++; }
          if (ti > 0 && d.turns[ti - 1].who !== 'npc') err(tw, 'twee beurten van de gebruiker achter elkaar');
        } else err(tw, `onbekende who "${t.who}"`);
      });
      if (youCount < 4 || youCount > 10) err(w, `dialogue: 4 tot 10 beurten voor de gebruiker nodig (nu ${youCount})`);
      if (l.cards || l.quiz || l.exercises) err(w, 'dialogue mag alleen dialogue hebben');
    }
  });
  if (counts.test !== 1) err(name, `precies 1 toets nodig (nu ${counts.test})`);
  if (counts.dialogue < 3) err(name, `minstens 3 gesprekken nodig (nu ${counts.dialogue})`);
  if (counts.learn < 3) err(name, `minstens 3 uitlegles-sen nodig (nu ${counts.learn})`);
  stats.push(`${name}: ${lv.lessons.length} lessen (${counts.learn} uitleg, ${counts.practice} oefen, ${counts.dialogue} gesprek, ${counts.test} toets), ${exTotal} oefeningen ${JSON.stringify(types)}, ${police} politiegesprek(ken)`);
}

console.log(stats.join('\n'));
if (warns.length) console.log(`\n${warns.length} waarschuwing(en):\n` + warns.slice(0, 80).map((w) => ' - ' + w).join('\n') + (warns.length > 80 ? `\n ... en nog ${warns.length - 80}` : ''));
if (errors.length) {
  console.log(`\n${errors.length} FOUT(EN):\n` + errors.slice(0, 120).map((e) => ' x ' + e).join('\n') + (errors.length > 120 ? `\n ... en nog ${errors.length - 120}` : ''));
  process.exit(1);
}
console.log('\nGeen fouten.');
