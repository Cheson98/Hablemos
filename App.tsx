import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DialogueRunner } from './src/components/Dialogue';
import { ExerciseRunner } from './src/components/Runner';
import { LearnView } from './src/components/Learn';
import { REG } from './src/content';
import { lessonExercises } from './src/content/registry';
import { BadgeDef, SessionKind, Summary, summarize } from './src/engine/progress';
import { useBackHandler } from './src/hooks';
import { BadgesScreen } from './src/screens/Badges';
import { HomeScreen } from './src/screens/Home';
import { Onboarding } from './src/screens/Onboarding';
import { ResultsScreen } from './src/screens/Results';
import { ReviewScreen } from './src/screens/Review';
import { SettingsScreen } from './src/screens/Settings';
import { ProgressProvider, useStore } from './src/state';
import { C } from './src/theme';
import type { Exercise } from './src/types';

type Tab = 'path' | 'review' | 'badges' | 'settings';

type Route =
  | { name: 'lesson'; lessonId: string; run: number }
  | { name: 'session'; kind: SessionKind; title: string; exercises: Exercise[]; run: number }
  | { name: 'results'; summary: Summary; badges: BadgeDef[] };

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'path', icon: '🗺️', label: 'Pad' },
  { id: 'review', icon: '🔁', label: 'Herhalen' },
  { id: 'badges', icon: '🏅', label: 'Badges' },
  { id: 'settings', icon: '⚙️', label: 'Instellingen' },
];

function LessonScreen({ lessonId, onExit, onFinish }: { lessonId: string; onExit: () => void; onFinish: (s: Summary) => void }) {
  const ref = REG.lessons.get(lessonId);
  const [stage, setStage] = useState<'cards' | 'quiz'>('cards');
  if (!ref) return null;
  const { lesson } = ref;

  if (lesson.kind === 'learn') {
    if (stage === 'cards') return <LearnView lesson={lesson} onExit={onExit} onDone={() => setStage('quiz')} />;
    const quiz = lessonExercises(lesson);
    if (!quiz.length) {
      return <EmptyFinish onFinish={() => onFinish(summarize('learn', lesson.title, [], lesson.id))} />;
    }
    return (
      <ExerciseRunner exercises={quiz} kind="learn" title={lesson.title} lessonId={lesson.id} onExit={onExit} onFinish={onFinish} />
    );
  }
  if (lesson.kind === 'dialogue') {
    return <DialogueRunner lesson={lesson} onExit={onExit} onFinish={onFinish} />;
  }
  return (
    <ExerciseRunner
      exercises={lessonExercises(lesson)}
      kind={lesson.kind === 'test' ? 'test' : 'practice'}
      title={lesson.title}
      lessonId={lesson.id}
      onExit={onExit}
      onFinish={onFinish}
    />
  );
}

function EmptyFinish({ onFinish }: { onFinish: () => void }) {
  React.useEffect(() => {
    onFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 2,
        borderTopColor: C.line,
        backgroundColor: C.white,
        paddingBottom: insets.bottom,
      }}
    >
      {TABS.map((t) => {
        const active = t.id === tab;
        return (
          <Pressable
            key={t.id}
            testID={`tab-${t.id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => setTab(t.id)}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}
          >
            <Text style={{ fontSize: 24, opacity: active ? 1 : 0.55 }}>{t.icon}</Text>
            <Text style={{ fontSize: 11, fontWeight: '800', color: active ? C.orangeDark : C.ink2, marginTop: 2 }}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Shell() {
  const store = useStore();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('path');
  const [route, setRoute] = useState<Route | null>(null);
  const [runId, setRunId] = useState(0);

  const goHome = useCallback(() => {
    setRoute(null);
    setTab('path');
  }, []);

  const onBack = useCallback(() => {
    // Schermen met een route (les, sessie, resultaat) regelen hun eigen terugknop.
    if (route) return false;
    if (tab !== 'path') {
      setTab('path');
      return true;
    }
    return false;
  }, [route, tab]);
  useBackHandler(onBack);

  if (!store.p.onboardingDone) {
    return <Onboarding onDone={store.finishOnboarding} />;
  }

  function finished(s: Summary) {
    const badges = store.finish(s);
    setRoute({ name: 'results', summary: s, badges });
  }

  function startSession(kind: SessionKind, title: string, exercises: Exercise[]) {
    if (!exercises.length) return;
    setRunId((n) => n + 1);
    setRoute({ name: 'session', kind, title, exercises, run: runId + 1 });
  }

  if (route?.name === 'lesson') {
    return <LessonScreen key={`${route.lessonId}-${route.run}`} lessonId={route.lessonId} onExit={() => setRoute(null)} onFinish={finished} />;
  }
  if (route?.name === 'session') {
    return (
      <ExerciseRunner
        key={`s-${route.run}`}
        exercises={route.exercises}
        kind={route.kind}
        title={route.title}
        onExit={() => setRoute(null)}
        onFinish={finished}
      />
    );
  }
  if (route?.name === 'results') {
    const s = route.summary;
    return (
      <ResultsScreen
        summary={s}
        badges={route.badges}
        onHome={goHome}
        onRetryMistakes={() => startSession('retry', 'Fouten oefenen', s.mistakes)}
        onRepeat={() => {
          if (s.lessonId) {
            setRunId((n) => n + 1);
            setRoute({ name: 'lesson', lessonId: s.lessonId, run: runId + 1 });
          } else goHome();
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <View style={{ flex: 1 }}>
        {tab === 'path' && (
          <HomeScreen
            onOpen={(id) => {
              setRunId((n) => n + 1);
              setRoute({ name: 'lesson', lessonId: id, run: runId + 1 });
            }}
          />
        )}
        {tab === 'review' && <ReviewScreen onStart={(r) => startSession(r.kind, r.title, r.exercises)} />}
        {tab === 'badges' && <BadgesScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </View>
      <TabBar tab={tab} setTab={setTab} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ProgressProvider>
        <Shell />
      </ProgressProvider>
    </SafeAreaProvider>
  );
}
