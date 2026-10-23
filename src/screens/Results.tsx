import React, { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Card, Mascot, Muted } from '../components/ui';
import { primaryAnswer } from '../engine/check';
import { BadgeDef, Summary, currentStreak, dayKey } from '../engine/progress';
import { useBackHandler } from '../hooks';
import { useStore } from '../state';
import { C, R } from '../theme';

function titleFor(s: Summary): { big: string; small: string } {
  if (s.kind === 'test') {
    return s.passed
      ? { big: '¡Toets gehaald!', small: 'Het volgende niveau is geopend.' }
      : { big: 'Bijna!', small: 'Je hebt 80% nodig. Kijk je fouten na en probeer het nog eens.' };
  }
  if (s.kind === 'review' || s.kind === 'retry' || s.kind === 'mix') {
    return { big: '¡Bien hecho!', small: 'Herhaling maakt je sterker.' };
  }
  if (s.kind === 'dialogue') return { big: '¡Buena conversación!', small: 'Je hebt een gesprek in het Spaans gevoerd.' };
  return { big: '¡Lección completada!', small: 'Goed gedaan.' };
}

export function ResultsScreen({
  summary,
  badges,
  onHome,
  onRetryMistakes,
  onRepeat,
}: {
  summary: Summary;
  badges: BadgeDef[];
  onHome: () => void;
  onRetryMistakes: () => void;
  onRepeat: () => void;
}) {
  const { p } = useStore();
  const insets = useSafeAreaInsets();
  const back = useCallback(() => {
    onHome();
    return true;
  }, [onHome]);
  useBackHandler(back);
  const t = titleFor(summary);
  const showStars = summary.kind !== 'review' && summary.kind !== 'mix' && summary.kind !== 'retry';
  const failedTest = summary.kind === 'test' && !summary.passed;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20, alignItems: 'stretch' }}>
        <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 18 }}>
          <Mascot size={96} />
          <Text style={{ fontSize: 28, fontWeight: '800', color: C.ink, marginTop: 12, textAlign: 'center' }}>{t.big}</Text>
          <Muted style={{ textAlign: 'center', marginTop: 4 }}>{t.small}</Muted>
          {showStars && !failedTest ? (
            <Text style={{ fontSize: 40, marginTop: 10, letterSpacing: 6 }}>
              {'⭐'.repeat(summary.stars)}
              <Text style={{ opacity: 0.25 }}>{'⭐'.repeat(Math.max(0, 3 - summary.stars))}</Text>
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <Stat label="Goed" value={`${summary.firstCorrect}/${summary.total}`} tone={C.green} />
          <Stat label="Score" value={`${summary.pct}%`} tone={C.blue} />
          <Stat label="XP" value={`+${summary.xp}`} tone={C.amberDark} />
        </View>
        <Card style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 28, marginRight: 10 }}>🔥</Text>
          <Text style={{ fontSize: 16, color: C.ink, flex: 1 }}>
            Reeks: <Text style={{ fontWeight: '800' }}>{currentStreak(p, dayKey())} dag(en)</Text> op rij. Totaal{' '}
            <Text style={{ fontWeight: '800' }}>{p.xp} XP</Text>.
          </Text>
        </Card>

        {badges.length > 0 ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink, marginBottom: 8 }}>Nieuwe badge{badges.length > 1 ? 's' : ''}!</Text>
            {badges.map((b) => (
              <View
                key={b.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: C.amberBg,
                  borderRadius: R.md,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 34, marginRight: 12 }}>{b.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: C.ink }}>{b.name}</Text>
                  <Muted>{b.desc}</Muted>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {summary.mistakes.length > 0 ? (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink, marginBottom: 8 }}>
              Dit ging nog niet goed ({summary.mistakes.length})
            </Text>
            {summary.mistakes.map((m) => (
              <View
                key={m.id}
                style={{
                  backgroundColor: C.white,
                  borderWidth: 2,
                  borderColor: C.line,
                  borderRadius: R.md,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                {m.npc ? <Text style={{ fontSize: 14, color: C.ink2, marginBottom: 4 }}>↩ {m.npc.es}</Text> : null}
                <Text style={{ fontSize: 17, fontWeight: '800', color: C.ink }}>{primaryAnswer(m)}</Text>
                {m.explain ? <Text style={{ fontSize: 14, color: C.ink2, marginTop: 4, lineHeight: 20 }}>{m.explain.replace(/\*\*/g, '')}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={{ padding: 16, paddingBottom: 16 + insets.bottom, borderTopWidth: 2, borderTopColor: C.line }}>
        {failedTest ? (
          <Btn testID="repeat" label="Opnieuw proberen" color="orange" onPress={onRepeat} style={{ marginBottom: 10 }} />
        ) : null}
        {summary.mistakes.length > 0 && summary.kind !== 'test' && summary.kind !== 'retry' ? (
          <Btn
            testID="retry-mistakes"
            label="Fouten opnieuw oefenen"
            color="blue"
            onPress={onRetryMistakes}
            style={{ marginBottom: 10 }}
          />
        ) : null}
        <Btn testID="home" label="Doorgaan" color={failedTest ? 'white' : 'green'} onPress={onHome} />
      </View>
    </View>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <View
      style={{
        flex: 1,
        marginHorizontal: 4,
        backgroundColor: C.white,
        borderWidth: 2,
        borderColor: C.line,
        borderRadius: R.md,
        paddingVertical: 12,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: '800', color: tone }}>{value}</Text>
      <Text style={{ fontSize: 12, fontWeight: '800', color: C.ink2, marginTop: 2 }}>{label.toUpperCase()}</Text>
    </View>
  );
}
