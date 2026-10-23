import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LEVELS } from './content';
import {
  AnswerEvent,
  BadgeDef,
  Summary,
  applyAnswer,
  applySession,
  initialProgress,
} from './engine/progress';
import { clearProgress, loadProgress, saveProgress } from './storage';
import type { Progress, Settings } from './types';

export type Store = {
  p: Progress;
  answer: (ev: AnswerEvent) => void;
  finish: (s: Summary) => BadgeDef[];
  setSettings: (patch: Partial<Settings>) => void;
  finishOnboarding: () => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [p, setP] = useState<Progress | null>(null);
  const ref = useRef<Progress>(initialProgress());

  useEffect(() => {
    let alive = true;
    loadProgress().then((loaded) => {
      if (!alive) return;
      const v = loaded ?? initialProgress();
      ref.current = v;
      setP(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  const commit = useCallback((next: Progress) => {
    ref.current = next;
    setP(next);
    saveProgress(next);
  }, []);

  const store = useMemo<Store | null>(() => {
    if (!p) return null;
    return {
      p,
      answer: (ev) => commit(applyAnswer(ref.current, ev)),
      finish: (s) => {
        const r = applySession(ref.current, s, LEVELS);
        commit(r.progress);
        return r.newBadges;
      },
      setSettings: (patch) =>
        commit({ ...ref.current, settings: { ...ref.current.settings, ...patch } }),
      finishOnboarding: () => commit({ ...ref.current, onboardingDone: true }),
      reset: () => {
        const fresh = initialProgress();
        fresh.onboardingDone = true;
        fresh.settings = { ...ref.current.settings, unlockAll: false };
        clearProgress();
        commit(fresh);
      },
    };
  }, [p, commit]);

  if (!store) return null;
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore buiten ProgressProvider');
  return s;
}
