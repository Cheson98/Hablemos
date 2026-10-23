import React, { useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REG } from '../content';
import { SessionItem, SessionKind, Summary, summarize } from '../engine/progress';
import { confirmExit, useBackHandler } from '../hooks';
import { useStore } from '../state';
import { C } from '../theme';
import type { Exercise } from '../types';
import { ExercisePanel, Resolved } from './Exercise';
import { ProgressBar } from './ui';

type QItem = { ex: Exercise; retry: boolean };

export function langOf(ex: Exercise): 'nl' | 'mix' | 'es' {
  return REG.exerciseLevel.get(ex.id)?.instructionLang ?? 'nl';
}

export function ExerciseRunner({
  exercises,
  kind,
  title,
  lessonId,
  onExit,
  onFinish,
}: {
  exercises: Exercise[];
  kind: SessionKind;
  title: string;
  lessonId?: string;
  onExit: () => void;
  onFinish: (s: Summary) => void;
}) {
  const store = useStore();
  const insets = useSafeAreaInsets();
  const [queue, setQueue] = useState<QItem[]>(() => exercises.map((ex) => ({ ex, retry: false })));
  const [idx, setIdx] = useState(0);
  const items = useRef<Map<string, SessionItem>>(new Map());

  const ask = useCallback(() => {
    confirmExit(onExit);
    return true;
  }, [onExit]);
  useBackHandler(ask);

  const cur = queue[idx];

  function checked(r: Resolved) {
    store.answer({ ex: cur.ex, correct: r.verdict.correct, firstTry: !cur.retry, mode: kind });
    if (!cur.retry) {
      items.current.set(cur.ex.id, { ex: cur.ex, first: r.verdict.correct, hint: r.hint });
      if (!r.verdict.correct && kind !== 'test') {
        setQueue((q) => [...q, { ex: cur.ex, retry: true }]);
      }
    }
  }

  function done() {
    if (idx + 1 >= queue.length) {
      const ordered: SessionItem[] = [];
      for (const ex of exercises) {
        const it = items.current.get(ex.id);
        if (it) ordered.push(it);
      }
      onFinish(summarize(kind, title, ordered, lessonId));
    } else {
      setIdx(idx + 1);
    }
  }

  if (!cur) return null;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 }}>
        <Pressable accessibilityLabel="Stoppen" onPress={ask} style={{ padding: 6, marginRight: 8 }}>
          <Text style={{ fontSize: 24, color: C.ink2, fontWeight: '800' }}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={idx / queue.length} />
        </View>
        <Text style={{ marginLeft: 10, fontSize: 14, fontWeight: '800', color: C.ink2 }}>
          {idx + 1}/{queue.length}
        </Text>
      </View>
      {cur.retry ? (
        <View style={{ marginHorizontal: 16, alignSelf: 'flex-start', backgroundColor: C.amberBg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12 }}>
          <Text style={{ fontWeight: '800', color: C.ink, fontSize: 13 }}>🔁 Nog een keer</Text>
        </View>
      ) : null}
      <ExercisePanel
        key={`${cur.ex.id}-${idx}`}
        ex={cur.ex}
        lang={langOf(cur.ex)}
        onChecked={checked}
        onDone={done}
      />
    </View>
  );
}
