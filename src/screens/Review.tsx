import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LEVELS, REG } from '../content';
import { lessonExercises } from '../content/registry';
import { Btn, Card, H, Muted } from '../components/ui';
import { lessonDone } from '../engine/progress';
import { pickRandom } from '../engine/text';
import { useStore } from '../state';
import { C } from '../theme';
import type { Exercise } from '../types';

export type SessionRequest = { kind: 'review' | 'mix'; title: string; exercises: Exercise[] };

export function ReviewScreen({ onStart }: { onStart: (r: SessionRequest) => void }) {
  const { p } = useStore();

  const bankList = Object.entries(p.mistakes)
    .sort((a, b) => b[1].n - a[1].n || a[1].last - b[1].last)
    .map(([id]) => REG.exercises.get(id))
    .filter((e): e is Exercise => !!e);

  const pool: Exercise[] = [];
  for (const lv of LEVELS) for (const l of lv.lessons) if (lessonDone(p, l.id)) pool.push(...lessonExercises(l));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
      <H size={26} style={{ marginBottom: 4 }}>
        Herhalen
      </H>
      <Muted style={{ marginBottom: 16 }}>Herhaling is hoe je Spaans echt onthoudt. Kies hieronder wat je wilt oefenen.</Muted>

      <Card style={{ marginBottom: 14, borderColor: C.red }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 30, marginRight: 10 }}>🎯</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 19, fontWeight: '800', color: C.ink }}>Foutenbak</Text>
            <Muted>
              {bankList.length === 0
                ? 'Geen openstaande fouten. Mooi zo!'
                : `${bankList.length} oefening${bankList.length === 1 ? '' : 'en'} waar je eerder een fout in maakte`}
            </Muted>
          </View>
        </View>
        <Muted style={{ marginBottom: 12 }}>
          Een oefening verdwijnt uit de bak zodra je hem twee keer goed hebt gedaan.
        </Muted>
        <Btn
          testID="start-review"
          label="Fouten oefenen"
          color="red"
          disabled={bankList.length === 0}
          onPress={() => onStart({ kind: 'review', title: 'Foutenbak', exercises: bankList.slice(0, 10) })}
        />
      </Card>

      <Card style={{ borderColor: C.blue }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 30, marginRight: 10 }}>🔀</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 19, fontWeight: '800', color: C.ink }}>Mixoefening</Text>
            <Muted>
              {pool.length === 0
                ? 'Rond eerst een paar lessen af.'
                : '10 willekeurige vragen uit alles wat je al hebt geleerd'}
            </Muted>
          </View>
        </View>
        <Btn
          testID="start-mix"
          label="Start mixoefening"
          color="blue"
          disabled={pool.length < 3}
          onPress={() => onStart({ kind: 'mix', title: 'Mixoefening', exercises: pickRandom(pool, 10) })}
        />
      </Card>
    </ScrollView>
  );
}
