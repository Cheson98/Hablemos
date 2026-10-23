import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { primaryAnswer } from '../engine/check';
import { SessionItem, Summary, summarize } from '../engine/progress';
import { confirmExit, useBackHandler } from '../hooks';
import { speak } from '../speech';
import { useStore } from '../state';
import { C, R } from '../theme';
import type { Exercise, Lesson } from '../types';
import { ExercisePanel, Resolved } from './Exercise';
import { langOf } from './Runner';
import { Btn, IconBtn, Pill, SpeakBtn } from './ui';

type Entry =
  | { k: 'npc'; id: number; es: string; nl: string }
  | { k: 'you'; id: number; es: string; ok: boolean };

function NpcBubble({
  entry,
  emoji,
  name,
  hideText,
}: {
  entry: Extract<Entry, { k: 'npc' }>;
  emoji: string;
  name: string;
  hideText: boolean;
}) {
  const [reveal, setReveal] = useState(false);
  const [showNl, setShowNl] = useState(false);
  const hidden = hideText && !reveal;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, maxWidth: '92%' }}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: C.amberBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>
      <View style={{ marginLeft: 8, flexShrink: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: C.ink2, marginBottom: 3 }}>{name}</Text>
        <View
          style={{
            backgroundColor: C.white,
            borderWidth: 2,
            borderColor: C.line,
            borderRadius: R.md,
            borderTopLeftRadius: 4,
            padding: 12,
          }}
        >
          {hidden ? (
            <Pressable onPress={() => setReveal(true)}>
              <Text style={{ fontSize: 16, color: C.blueDark, fontWeight: '700' }}>👂 Tik om de tekst te lezen</Text>
            </Pressable>
          ) : (
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.ink, lineHeight: 25 }}>{entry.es}</Text>
          )}
          {showNl ? <Text style={{ fontSize: 14, color: C.ink2, marginTop: 6 }}>{entry.nl}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
          <SpeakBtn text={entry.es} size={34} />
          <Pressable onPress={() => setShowNl((s) => !s)} style={{ marginLeft: 10, padding: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.blueDark }}>
              🌐 {showNl ? 'Verberg vertaling' : 'Vertaal'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function YouBubble({ entry }: { entry: Extract<Entry, { k: 'you' }> }) {
  return (
    <View style={{ alignSelf: 'flex-end', maxWidth: '88%', marginBottom: 12 }}>
      <View
        style={{
          backgroundColor: entry.ok ? C.greenBg : C.amberBg,
          borderWidth: 2,
          borderColor: entry.ok ? C.green : C.amber,
          borderRadius: R.md,
          borderTopRightRadius: 4,
          padding: 12,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.ink, lineHeight: 25 }}>{entry.es}</Text>
      </View>
      <Text style={{ alignSelf: 'flex-end', fontSize: 12, color: C.ink2, marginTop: 3, fontWeight: '700' }}>
        {entry.ok ? 'Jij ✓' : 'Zo kan het ook goed: ↑'}
      </Text>
    </View>
  );
}

export function DialogueRunner({
  lesson,
  onExit,
  onFinish,
}: {
  lesson: Lesson;
  onExit: () => void;
  onFinish: (s: Summary) => void;
}) {
  const store = useStore();
  const { p } = store;
  const dlg = lesson.dialogue!;
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pos, setPos] = useState(0);
  const [pending, setPending] = useState<Exercise | null>(null);
  const [finished, setFinished] = useState(false);
  const [hideText, setHideText] = useState(p.settings.listenMode);
  const items = useRef<Map<string, SessionItem>>(new Map());
  const scroller = useRef<ScrollView | null>(null);
  const idRef = useRef(0);
  const lastStart = useRef(-1);

  const ask = useCallback(() => {
    confirmExit(onExit);
    return true;
  }, [onExit]);
  useBackHandler(ask);

  useEffect(() => {
    if (pending || finished) return;
    if (lastStart.current === pos) return;
    lastStart.current = pos;
    let i = pos;
    const add: Entry[] = [];
    while (i < dlg.turns.length) {
      const t = dlg.turns[i];
      if (t.who !== 'npc') break;
      add.push({ k: 'npc', id: idRef.current++, es: t.es, nl: t.nl });
      i++;
    }
    if (add.length) {
      setEntries((e) => [...e, ...add]);
      if (p.settings.autoplay) {
        speak(
          add.map((a) => (a.k === 'npc' ? a.es : '')).join(' '),
          p.settings.rate,
        );
      }
    }
    if (i < dlg.turns.length) {
      const t = dlg.turns[i];
      if (t.who === 'you') setPending(t.ex);
      setPos(i + 1);
    } else {
      setFinished(true);
      setPos(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, pending, finished]);

  function checked(r: Resolved) {
    if (!pending) return;
    store.answer({ ex: pending, correct: r.verdict.correct, firstTry: true, mode: 'dialogue' });
    items.current.set(pending.id, { ex: pending, first: r.verdict.correct, hint: r.hint });
  }

  function done(r: Resolved) {
    if (!pending) return;
    const text = r.verdict.correct && pending.type !== 'choice' ? r.verdict.expected : primaryAnswer(pending);
    setEntries((e) => [...e, { k: 'you', id: idRef.current++, es: text, ok: r.verdict.correct }]);
    setPending(null);
  }

  function finish() {
    const ordered: SessionItem[] = [];
    for (const t of dlg.turns) {
      if (t.who === 'you') {
        const it = items.current.get(t.ex.id);
        if (it) ordered.push(it);
      }
    }
    onFinish(summarize('dialogue', lesson.title, ordered, lesson.id));
  }

  const panelHeight = Math.min(Math.round(height * 0.58), 560);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
        <Pressable accessibilityLabel="Stoppen" onPress={ask} style={{ padding: 6, marginRight: 6 }}>
          <Text style={{ fontSize: 24, color: C.ink2, fontWeight: '800' }}>✕</Text>
        </Pressable>
        <Text numberOfLines={1} style={{ flex: 1, fontSize: 18, fontWeight: '800', color: C.ink }}>
          {lesson.title}
        </Text>
        <IconBtn icon="👂" label={hideText ? 'Luistermodus aan' : 'Luistermodus'} active={hideText} onPress={() => setHideText((h) => !h)} />
      </View>

      <ScrollView
        ref={(r) => {
          scroller.current = r;
        }}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}
      >
        <View
          style={{
            backgroundColor: C.purpleBg,
            borderRadius: R.md,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.purpleDark, marginRight: 10 }}>SITUATIE</Text>
            <Pill bg={C.white} color={C.purpleDark}>
              {dlg.formal === 'usted' ? 'usted' : dlg.formal === 'tú' ? 'tú' : 'usted en tú'}
            </Pill>
          </View>
          <Text style={{ fontSize: 16, color: C.ink, lineHeight: 23 }}>{dlg.setting}</Text>
        </View>
        {entries.map((e) =>
          e.k === 'npc' ? (
            <NpcBubble key={e.id} entry={e} emoji={dlg.npcEmoji} name={dlg.npcName} hideText={hideText} />
          ) : (
            <YouBubble key={e.id} entry={e} />
          ),
        )}
      </ScrollView>

      {pending ? (
        <View style={{ height: panelHeight, borderTopWidth: 2, borderTopColor: C.line, backgroundColor: C.bg }}>
          <ExercisePanel
            key={pending.id}
            ex={pending}
            lang={langOf(pending)}
            embedded
            onChecked={checked}
            onDone={done}
          />
        </View>
      ) : finished ? (
        <View style={{ padding: 16, paddingBottom: 16 + insets.bottom, borderTopWidth: 2, borderTopColor: C.line }}>
          <Btn testID="dialogue-finish" label="Naar de resultaten" onPress={finish} />
        </View>
      ) : null}
    </View>
  );
}
