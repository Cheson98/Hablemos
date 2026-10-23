import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Btn, Card, H, Muted } from '../components/ui';
import { speak, spanishVoiceAvailable } from '../speech';
import { useStore } from '../state';
import { C } from '../theme';

function Toggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: C.ink }}>{label}</Text>
        {desc ? <Muted style={{ marginTop: 2 }}>{desc}</Muted> : null}
      </View>
      <View
        style={{
          width: 52,
          height: 30,
          borderRadius: 15,
          backgroundColor: value ? C.green : C.locked,
          justifyContent: 'center',
          paddingHorizontal: 3,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: C.white,
            alignSelf: value ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </Pressable>
  );
}

export function SettingsScreen() {
  const store = useStore();
  const { p } = store;

  async function testVoice() {
    speak('Hola, ¿qué tal? Soy tu profesor de español.', p.settings.rate);
    const ok = await spanishVoiceAvailable();
    if (!ok) {
      Alert.alert(
        'Geen Spaanse stem gevonden',
        'Open op je telefoon Instellingen > Systeem > Talen > Tekst-naar-spraak (of "Spraak") en installeer de Spaanse (Spanje) stem in Google Tekst-naar-spraak.',
      );
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
      <H size={26} style={{ marginBottom: 12 }}>
        Instellingen
      </H>

      <Card style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: C.ink2, marginBottom: 6 }}>SPRAAK</Text>
        <Text style={{ fontSize: 17, fontWeight: '700', color: C.ink, marginBottom: 8 }}>Voorleestempo</Text>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <Btn
            label="Normaal"
            small
            color={p.settings.rate === 'normaal' ? 'blue' : 'white'}
            onPress={() => store.setSettings({ rate: 'normaal' })}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Btn
            label="Langzaam"
            small
            color={p.settings.rate === 'langzaam' ? 'blue' : 'white'}
            onPress={() => store.setSettings({ rate: 'langzaam' })}
            style={{ flex: 1 }}
          />
        </View>
        <Toggle
          label="Automatisch voorlezen"
          desc="Spaanse zinnen en gespreksregels worden vanzelf voorgelezen."
          value={p.settings.autoplay}
          onChange={(v) => store.setSettings({ autoplay: v })}
        />
        <Toggle
          label="Luistermodus in gesprekken"
          desc="De Spaanse tekst van de ander blijft verborgen tot je erop tikt. Goed voor je luistervaardigheid."
          value={p.settings.listenMode}
          onChange={(v) => store.setSettings({ listenMode: v })}
        />
        <Btn label="Test de Spaanse stem" color="teal" small onPress={testVoice} style={{ marginTop: 6 }} />
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: C.ink2, marginBottom: 6 }}>PAD</Text>
        <Toggle
          label="Alle niveaus openen"
          desc="Testmodus: laat je alle lessen bekijken zonder de vorige af te ronden. Zet dit uit om weer het vaste pad te volgen."
          value={p.settings.unlockAll}
          onChange={(v) => store.setSettings({ unlockAll: v })}
        />
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: C.ink2, marginBottom: 6 }}>OVER HABLEMOS</Text>
        <Muted>
          Hablemos is een leerhulp om Spaans te leren spreken (Spaans zoals in Spanje). De politiegesprekken zijn oefenmateriaal en geen vervanging
          voor een beëdigd tolk of voor wettelijke voorschriften bij officiële procedures. Je voortgang staat alleen op dit toestel.
        </Muted>
      </Card>

      <Btn
        label="Voortgang wissen"
        color="red"
        small
        onPress={() =>
          Alert.alert('Voortgang wissen?', 'Al je XP, badges en afgeronde lessen gaan verloren.', [
            { text: 'Annuleren', style: 'cancel' },
            { text: 'Wissen', style: 'destructive', onPress: () => store.reset() },
          ])
        }
      />
    </ScrollView>
  );
}
