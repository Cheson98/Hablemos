import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { LEVELS } from '../content';
import { Btn, Card, Mascot, Pill, ProgressBar } from '../components/ui';
import { currentStreak, dayKey, isUnlocked, levelDone, levelDoneCount, nextLesson } from '../engine/progress';
import { useStore } from '../state';
import { C, PAIR, R, levelColor } from '../theme';
import type { Lesson, LessonKind } from '../types';

const ICON: Record<LessonKind, string> = { learn: '📖', practice: '✏️', dialogue: '💬', test: '🏆' };
const KIND_NL: Record<LessonKind, string> = { learn: 'Les', practice: 'Oefenen', dialogue: 'Gesprek', test: 'Toets' };
const OFFSETS = [0, 34, 54, 34, 0, -34, -54, -34];

function Stars({ n }: { n: number }) {
  return (
    <Text style={{ fontSize: 14, letterSpacing: 1 }}>
      {'★'.repeat(n)}
      <Text style={{ color: C.locked }}>{'★'.repeat(Math.max(0, 3 - n))}</Text>
    </Text>
  );
}

function Node({
  lesson,
  index,
  color,
  unlocked,
  done,
  stars,
  isNext,
  onPress,
}: {
  lesson: Lesson;
  index: number;
  color: ReturnType<typeof levelColor>;
  unlocked: boolean;
  done: boolean;
  stars: number;
  isNext: boolean;
  onPress: () => void;
}) {
  const [bg, dark] = unlocked ? PAIR[color] : PAIR.gray;
  const off = OFFSETS[index % OFFSETS.length];
  return (
    <View style={{ alignItems: 'center', marginVertical: 10, transform: [{ translateX: off }] }}>
      {isNext ? (
        <View style={{ backgroundColor: C.white, borderWidth: 2, borderColor: bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 6 }}>
          <Text style={{ fontWeight: '800', color: dark, fontSize: 13 }}>¡EMPIEZA!</Text>
        </View>
      ) : null}
      <Pressable
        testID={`node-${lesson.id}`}
        accessibilityRole="button"
        accessibilityLabel={`${KIND_NL[lesson.kind]}: ${lesson.title}`}
        onPress={onPress}
        style={({ pressed }) => ({
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: bg,
          borderBottomWidth: pressed ? 2 : 7,
          borderBottomColor: dark,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: pressed ? 5 : 0,
          borderWidth: isNext ? 4 : 0,
          borderColor: isNext ? C.white : 'transparent',
        })}
      >
        <Text style={{ fontSize: 32, opacity: unlocked ? 1 : 0.6 }}>{unlocked ? ICON[lesson.kind] : '🔒'}</Text>
      </Pressable>
      <Text numberOfLines={2} style={{ marginTop: 6, maxWidth: 150, textAlign: 'center', fontSize: 13, fontWeight: '700', color: unlocked ? C.ink : C.ink2 }}>
        {lesson.title}
      </Text>
      {done ? <Stars n={stars} /> : <Text style={{ fontSize: 12, color: C.ink2 }}>{KIND_NL[lesson.kind]}</Text>}
    </View>
  );
}

export function HomeScreen({ onOpen }: { onOpen: (lessonId: string) => void }) {
  const { p } = useStore();
  const next = nextLesson(p, LEVELS);
  const [open, setOpen] = useState<Set<number>>(() => new Set([next ? next.level.n : 1]));
  const scroller = useRef<ScrollView | null>(null);
  const ys = useRef<Record<number, number>>({});
  const streak = currentStreak(p, dayKey());

  useEffect(() => {
    if (!next) return;
    const t = setTimeout(() => {
      const y = ys.current[next.level.n];
      if (y !== undefined) scroller.current?.scrollTo({ y: Math.max(0, y - 8), animated: false });
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(n: number) {
    setOpen((s) => {
      const c = new Set(s);
      if (c.has(n)) c.delete(n);
      else c.add(n);
      return c;
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={(r) => {
          scroller.current = r;
        }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Mascot size={56} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: C.ink }}>¡Hola!</Text>
            <Text style={{ fontSize: 14, color: C.ink2 }}>Vandaag even Spaans oefenen?</Text>
          </View>
          <Pill bg={C.amberBg}>🔥 {streak}</Pill>
          <View style={{ width: 8 }} />
          <Pill bg={C.blueBg} color={C.blueDark}>
            ⭐ {p.xp}
          </Pill>
        </View>

        {LEVELS.map((lv, li) => {
          const [bg, dark] = PAIR[levelColor(lv.n)];
          const done = levelDoneCount(p, lv);
          const expanded = open.has(lv.n);
          const lvDone = levelDone(p, lv);
          return (
            <View
              key={lv.id}
              onLayout={(e) => {
                ys.current[lv.n] = e.nativeEvent.layout.y;
              }}
              style={{ marginBottom: 14 }}
            >
              <Pressable
                testID={`level-${lv.n}`}
                onPress={() => toggle(lv.n)}
                style={({ pressed }) => ({
                  backgroundColor: bg,
                  borderBottomWidth: pressed ? 2 : 6,
                  borderBottomColor: dark,
                  borderRadius: R.lg,
                  padding: 16,
                  marginTop: pressed ? 4 : 0,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 34, marginRight: 12 }}>{lv.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 }}>
                      NIVEAU {lv.n}
                      {lvDone ? '  ✓ KLAAR' : ''}
                    </Text>
                    <Text style={{ color: C.white, fontSize: 20, fontWeight: '800' }}>{lv.title}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 14 }}>{lv.subtitle}</Text>
                  </View>
                  <Text style={{ color: C.white, fontSize: 22, fontWeight: '800' }}>{expanded ? '▾' : '▸'}</Text>
                </View>
                <View style={{ marginTop: 12 }}>
                  <ProgressBar value={done / Math.max(1, lv.lessons.length)} color={C.white} height={10} />
                  <Text style={{ color: C.white, fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                    {done} van {lv.lessons.length} lessen
                  </Text>
                </View>
              </Pressable>

              {expanded ? (
                <View style={{ paddingTop: 10 }}>
                  <Card style={{ backgroundColor: C.white, marginBottom: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: C.ink2, marginBottom: 4 }}>DOELEN</Text>
                    {lv.goals.map((g, gi) => (
                      <Text key={gi} style={{ fontSize: 14, color: C.ink, lineHeight: 20 }}>
                        • {g}
                      </Text>
                    ))}
                  </Card>
                  {lv.lessons.map((l, si) => {
                    const unlocked = isUnlocked(p, LEVELS, li, si);
                    const res = p.lessons[l.id];
                    return (
                      <Node
                        key={l.id}
                        lesson={l}
                        index={si}
                        color={levelColor(lv.n)}
                        unlocked={unlocked}
                        done={!!res && res.done > 0}
                        stars={res?.stars ?? 0}
                        isNext={!!next && next.lesson.id === l.id}
                        onPress={() => {
                          if (!unlocked) {
                            Alert.alert('Nog op slot', 'Rond eerst de vorige les af om deze te openen.');
                            return;
                          }
                          onOpen(l.id);
                        }}
                      />
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
      {next ? (
        <View style={{ paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 2, borderTopColor: C.line, backgroundColor: C.bg }}>
          <Btn
            testID="continue-path"
            label={`Doorgaan: ${next.lesson.title}`}
            color={levelColor(next.level.n) === 'amber' ? 'orange' : 'green'}
            onPress={() => onOpen(next.lesson.id)}
          />
        </View>
      ) : null}
    </View>
  );
}
