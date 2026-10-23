// Zet level- en les-id's en oefening-id's automatisch goed, op basis van bestandsnaam en volgorde.
// Gebruik: node scripts/fix-ids.mjs src/content/levels/level03.json
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

for (const file of process.argv.slice(2)) {
  const m = basename(file).match(/^level(\d+)\.json$/);
  if (!m) {
    console.error(`Overgeslagen (naam klopt niet): ${file}`);
    continue;
  }
  const n = Number(m[1]);
  const lv = JSON.parse(readFileSync(file, 'utf8'));
  lv.n = n;
  lv.id = `L${String(n).padStart(2, '0')}`;
  (lv.lessons || []).forEach((l, i) => {
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
  writeFileSync(file, JSON.stringify(lv, null, 2) + '\n');
  console.log(`${file}: id's gezet (${lv.id}, ${(lv.lessons || []).length} lessen).`);
}
