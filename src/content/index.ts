// GEGENEREERD door scripts/build-index.mjs. Niet met de hand aanpassen.
import type { Level } from '../types';
import { buildRegistry } from './registry';
import l01 from './levels/level01.json';

export const LEVELS: Level[] = [l01] as unknown as Level[];
export const REG = buildRegistry(LEVELS);
