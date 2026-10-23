import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { confirmExit, useBackHandler } from '../hooks';
import { C, R } from '../theme';
import type { Card, Lesson, TipTone } from '../types';
import { Btn, H, ProgressBar, Rich, Row, SpeakBtn } from './ui';

const TONES: Record<TipTone, { icon: string; bg: string; border: string; title: string }> = {
  tip: { icon: '💡', bg: C.amberBg, border: C.amber, title: 'Tip' },
  warn: { icon: '⚠️', bg: C.redBg, border: C.red, title: 'Let op' },
  spain: { icon: '🇪🇸', bg: C.blueBg, border: C.blue, title: 'In Spanje' },
  police: { icon: '👮', bg: C.purpleBg, border: C.purple, title: 'Politiewerk' },
};

function CardView({ card }: { card: Card }) {
  switch (card.kind) {
    case 'text':
      return (
        <View>
          {card.title ? <H style={{ marginBottom: 10 }}>{card.title}</H> : null}
          <Rich text={card.body} style={{ fontSize: 18, lineHeight: 27 }} />
        </View>
      );
    case 'examples':
      return (
        <View>
          {card.title ? <H style={{ marginBottom: 6 }}>{card.title}</H> : null}
          {card.intro ? <Rich text={card.intro} style={{ marginBottom: 10 }} /> : null}
          {card.items.map((it, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: C.white,
                borderWidth: 2,
                borderColor: C.line,
                borderRadius: R.md,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <SpeakBtn text={it.es} size={40} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink }}>{it.es}</Text>
                <Text style={{ fontSize: 15, color: C.ink2, marginTop: 2 }}>{it.nl}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    case 'table':
      return (
        <View>
          {card.title ? <H style={{ marginBottom: 6 }}>{card.title}</H> : null}
          {card.intro ? <Rich text={card.intro} style={{ marginBottom: 10 }} /> : null}
          <View
            style={{
              borderWidth: 2,
              borderColor: C.line,
              borderRadius: R.md,
              overflow: 'hidden',
              backgroundColor: C.white,
            }}
          >
            <View style={{ flexDirection: 'row', backgroundColor: C.purpleBg }}>
              {card.head.map((h, i) => (
                <View key={i} style={{ flex: 1, padding: 10 }}>
                  <Text style={{ fontWeight: '800', color: C.purpleDark, fontSize: 14 }}>{h}</Text>
                </View>
              ))}
            </View>
            {card.rows.map((r, ri) => (
              <View key={ri} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line }}>
                {r.map((c, ci) => (
                  <View key={ci} style={{ flex: 1, padding: 10 }}>
                    <Rich text={c} style={{ fontSize: 16, lineHeight: 22 }} />
                  </View>
                ))}
              </View>
            ))}
          </View>
          {card.note ? <Rich text={card.note} style={{ marginTop: 10, fontSize: 15, color: C.ink2 }} /> : null}
        </View>
      );
    case 'tip': {
      const t = TONES[card.tone ?? 'tip'];
      return (
        <View
          style={{
            backgroundColor: t.bg,
            borderLeftWidth: 6,
            borderLeftColor: t.border,
            borderRadius: R.md,
            padding: 16,
          }}
        >
          <Row style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 22, marginRight: 8 }}>{t.icon}</Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: C.ink }}>{card.title ?? t.title}</Text>
          </Row>
          <Rich text={card.body} style={{ fontSize: 17, lineHeight: 25 }} />
        </View>
      );
    }
  }
}

export function LearnView({
  lesson,
  onExit,
  onDone,
}: {
  lesson: Lesson;
  onExit: () => void;
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const cards = lesson.cards ?? [];
  const [i, setI] = useState(0);
  const ask = useCallback(() => {
    if (i === 0) {
      onExit();
    } else {
      confirmExit(onExit);
    }
    return true;
  }, [i, onExit]);
  useBackHandler(ask);

  const last = i >= cards.length - 1;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 }}>
        <Pressable accessibilityLabel="Sluiten" onPress={ask} style={{ padding: 6, marginRight: 8 }}>
          <Text style={{ fontSize: 24, color: C.ink2, fontWeight: '800' }}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={(i + 1) / Math.max(1, cards.length)} color={C.blue} />
        </View>
      </View>
      <ScrollView
        key={i}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      >
        <Text style={{ fontSize: 13, fontWeight: '800', color: C.blueDark, marginBottom: 8 }}>
          {lesson.emoji}  {lesson.title.toUpperCase()}
        </Text>
        {cards[i] ? <CardView card={cards[i]} /> : null}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          padding: 16,
          paddingBottom: 16 + insets.bottom,
          borderTopWidth: 2,
          borderTopColor: C.line,
          backgroundColor: C.bg,
        }}
      >
        {i > 0 ? (
          <Btn label="Terug" color="white" onPress={() => setI(i - 1)} style={{ flex: 1, marginRight: 10 }} />
        ) : null}
        <Btn
          testID="learn-next"
          label={last ? 'Naar de oefeningen' : 'Verder'}
          color={last ? 'green' : 'blue'}
          onPress={() => (last ? onDone() : setI(i + 1))}
          style={{ flex: 2 }}
        />
      </View>
    </View>
  );
}
