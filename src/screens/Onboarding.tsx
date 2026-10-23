import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Mascot } from '../components/ui';
import { speak } from '../speech';
import { C } from '../theme';

const PAGES = [
  {
    title: '¡Hola! Welkom bij Hablemos',
    body: 'Hier leer je Spaans praten, stap voor stap. Geen lijstjes stampen: je leert wat je nodig hebt om een gesprek te voeren.',
  },
  {
    title: 'Zo werkt het',
    body: 'Elk niveau heeft korte lessen, oefeningen en gesprekken. Na elk antwoord zie je meteen of het goed is, en je fouten komen terug in de herhaling. Ongeveer 15 tot 20 minuten per keer is genoeg.',
  },
  {
    title: 'Zet je geluid aan',
    body: 'Je hoort de Spaanse zinnen met een stem uit Spanje. Hoor je niets? Ga naar Instellingen in de app en tik op "Test de Spaanse stem". Daar staat ook wat je kunt doen als de stem ontbreekt.',
  },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const insets = useSafeAreaInsets();
  const page = PAGES[i];
  const last = i === PAGES.length - 1;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16, paddingHorizontal: 24 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Mascot size={140} />
        <Text style={{ fontSize: 28, fontWeight: '800', color: C.ink, textAlign: 'center', marginTop: 24 }}>{page.title}</Text>
        <Text style={{ fontSize: 18, color: C.ink2, textAlign: 'center', marginTop: 12, lineHeight: 27 }}>{page.body}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
        {PAGES.map((_, k) => (
          <View
            key={k}
            style={{ width: 10, height: 10, borderRadius: 5, marginHorizontal: 4, backgroundColor: k === i ? C.orange : C.line }}
          />
        ))}
      </View>
      <Btn
        testID="onboarding-next"
        label={last ? 'Aan de slag' : 'Verder'}
        onPress={() => {
          if (i === 0) speak('Hola, bienvenido a Hablemos.');
          if (last) onDone();
          else setI(i + 1);
        }}
      />
    </View>
  );
}
