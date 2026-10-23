import * as Speech from 'expo-speech';
import { speakable } from './engine/text';

export type Rate = 'normaal' | 'langzaam';

/** Leest Spaanse tekst voor met een stem uit Spanje (es-ES). */
export function speak(text: string, rate: Rate = 'normaal', onDone?: () => void): void {
  const t = speakable(text);
  if (!t) {
    onDone?.();
    return;
  }
  try {
    Promise.resolve(Speech.stop()).catch(() => {});
    Speech.speak(t, {
      language: 'es-ES',
      rate: rate === 'langzaam' ? 0.55 : 0.95,
      pitch: 1.0,
      onDone,
      onStopped: onDone,
      onError: onDone,
    });
  } catch {
    onDone?.();
  }
}

export function stopSpeaking(): void {
  try {
    Promise.resolve(Speech.stop()).catch(() => {});
  } catch {
    // negeren
  }
}

/** Controleert of er een Spaanse stem op het toestel staat. */
export async function spanishVoiceAvailable(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices || !voices.length) return true; // onbekend: niet waarschuwen
    return voices.some((v) => (v.language || '').toLowerCase().startsWith('es'));
  } catch {
    return true;
  }
}
