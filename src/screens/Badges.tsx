import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LEVELS } from '../content';
import { H, Muted } from '../components/ui';
import { badgeDefs } from '../engine/progress';
import { useStore } from '../state';
import { C, R } from '../theme';

export function BadgesScreen() {
  const { p } = useStore();
  const defs = badgeDefs(LEVELS);
  const earned = defs.filter((d) => p.badges[d.id]).length;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
      <H size={26} style={{ marginBottom: 4 }}>
        Badges
      </H>
      <Muted style={{ marginBottom: 16 }}>
        {earned} van {defs.length} verdiend
      </Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 }}>
        {defs.map((d) => {
          const got = !!p.badges[d.id];
          return (
            <View key={d.id} style={{ width: '50%', padding: 5 }}>
              <View
                style={{
                  backgroundColor: got ? C.amberBg : C.white,
                  borderWidth: 2,
                  borderColor: got ? C.amber : C.line,
                  borderRadius: R.lg,
                  padding: 14,
                  alignItems: 'center',
                  minHeight: 150,
                }}
              >
                <Text style={{ fontSize: 40, opacity: got ? 1 : 0.25 }}>{got ? d.emoji : '🔒'}</Text>
                <Text style={{ fontSize: 15, fontWeight: '800', color: got ? C.ink : C.ink2, textAlign: 'center', marginTop: 6 }}>{d.name}</Text>
                <Text style={{ fontSize: 12, color: C.ink2, textAlign: 'center', marginTop: 4, lineHeight: 17 }}>{d.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
