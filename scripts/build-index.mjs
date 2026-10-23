// Genereert src/content/index.ts uit de aanwezige niveaubestanden (level01.json, level02.json, ...).
import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src', 'content', 'levels');
const files = readdirSync(dir)
  .filter((f) => /^level\d+\.json$/.test(f))
  .sort();

const imports = files.map((f, i) => `import l${String(i + 1).padStart(2, '0')} from './levels/${f}';`);
const names = files.map((_, i) => `l${String(i + 1).padStart(2, '0')}`);

const out = `// GEGENEREERD door scripts/build-index.mjs. Niet met de hand aanpassen.
import type { Level } from '../types';
import { buildRegistry } from './registry';
${imports.join('\n')}

export const LEVELS: Level[] = [${names.join(', ')}] as unknown as Level[];
export const REG = buildRegistry(LEVELS);
`;
writeFileSync(join(root, 'src', 'content', 'index.ts'), out);
console.log(`index.ts geschreven met ${files.length} niveau(s).`);
