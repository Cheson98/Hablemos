import AsyncStorage from '@react-native-async-storage/async-storage';
import { hydrate } from './engine/progress';
import type { Progress } from './types';

const KEY = 'hablemos.progress.v1';

export async function loadProgress(): Promise<Progress | null> {
  try {
    const s = await AsyncStorage.getItem(KEY);
    return s ? hydrate(JSON.parse(s)) : null;
  } catch {
    return null;
  }
}

export async function saveProgress(p: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // opslaan is best effort
  }
}

export async function clearProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // niets aan te doen
  }
}
