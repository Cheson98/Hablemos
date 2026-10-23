import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Answer, Verdict, checkExercise, instructionFor, primaryAnswer } from '../engine/check';
import { hashStr, seededShuffle } from '../engine/text';
import { speak } from '../speech';
import { useStore } from '../state';
import { C, R } from '../theme';
import type { Exercise } from '../types';
import { Btn, IconBtn, Mascot, Rich, Row, SpeakBtn } from './ui';

export type Resolved = { verdict: Verdict; hint: boolean };

type Props = {
  ex: Exercise;
  lang: 'nl' | 'mix' | 'es';
  /** Direct na "Controleer": hier registreert de aanroeper het antwoord. */
  onChecked: (r: Resolved) => void;
  /** Na "Doorgaan". */
  onDone: (r: Resolved) => void;
  /** In een gesprek wordt de regel van de gesprekspartner al elders getoond. */
  embedded?: boolean;
  continueLabel?: string;
};

const GOOD = ['¡Muy bien!', '¡Perfecto!', '¡Genial!', '¡Eso es!', '¡Excelente!', '¡Estupendo!'];
const BAD = ['Casi...', 'Ánimo', 'Otra vez será', 'No pasa nada'];

/** Het Spaanse antwoord dat we kunnen voorlezen na het nakijken. */
function spanishToSpeak(ex: Exercise, v: Verdict): string | null {
  if (ex.type === 'listen') return ex.es;
  if (ex.type === 'choice') return (ex.optionsLang ?? 'es') === 'es' ? v.expected : null;
  return v.expected;
}

export function ExercisePanel({ ex, lang, onChecked, onDone, embedded, continueLabel }: Props) {
  const { p } = useStore();
  const insets = useSafeAreaInsets();
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showNl, setShowNl] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  const bank = useMemo(
    () => (ex.type === 'build' ? seededShuffle(ex.words.map((w, i) => ({ w, i })), ex.id) : []),
    [ex],
  );

  // Luisteroefeningen starten vanzelf.
  useEffect(() => {
    if (ex.type === 'listen' && p.settings.autoplay) {
      const t = setTimeout(() => speak(ex.es, p.settings.rate), 350);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.id]);

  const locked = verdict !== null;

  const hasAnswer = (() => {
    switch (ex.type) {
      case 'choice':
        return choice !== null;
      case 'listen':
        return ex.mode === 'choose' ? choice !== null : text.trim().length > 0;
      case 'build':
        return picked.length > 0;
      default:
        return text.trim().length > 0;
    }
  })();

  function buildAnswer(): Answer {
    if (ex.type === 'choice') return { choice: choice ?? -1 };
    if (ex.type === 'listen' && ex.mode === 'choose') return { choice: choice ?? -1 };
    if (ex.type === 'build') return { text: picked.map((i) => bank[i].w).join(' ') };
    return { text };
  }

  function check() {
    if (!hasAnswer || locked) return;
    const v = checkExercise(ex, buildAnswer());
    setVerdict(v);
    onChecked({ verdict: v, hint: usedHint });
    if (p.settings.autoplay) {
      const s = spanishToSpeak(ex, v);
      if (s) setTimeout(() => speak(s, p.settings.rate), 250);
    }
  }

  // ----- hint en vertaling -----
  const hintText: string | null = (() => {
    if (ex.hint) return ex.hint;
    if (ex.type === 'fill' || ex.type === 'build' || ex.type === 'write') {
      const a = ex.type === 'fill' ? ex.answers[0] : ex.answers[0];
      const first = a.split(/\s+/)[0];
      return `Het antwoord begint met: «${first}»`;
    }
    return null;
  })();

  const canTranslate = (() => {
    if (ex.type === 'listen' && ex.mode === 'choose') return false;
    if (ex.type === 'choice') return !!ex.nl || !!ex.optionsNl;
    return !!ex.nl;
  })();

  // ----- opdracht -----
  const ins = instructionFor(ex);
  const insLines =
    lang === 'nl' ? [ins.nl] : lang === 'es' ? [ins.es] : [ins.es, ins.nl];

  const tint = verdict
    ? verdict.status === 'correct' || verdict.status === 'accent'
      ? C.greenBg
      : verdict.status === 'almost'
        ? C.amberBg
        : C.redBg
    : C.bg;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 15, fontWeight: '800', color: C.ink }}>{insLines[0]}</Text>
        {insLines[1] ? <Text style={{ fontSize: 13, color: C.ink2, marginBottom: 4 }}>{insLines[1]}</Text> : null}
        <View style={{ height: 10 }} />

        {!embedded && ex.npc ? <NpcLine es={ex.npc.es} nl={ex.npc.nl} /> : null}

        {ex.type === 'choice' && (
          <ChoiceBody ex={ex} choice={choice} setChoice={setChoice} verdict={verdict} showNl={showNl} />
        )}
        {ex.type === 'fill' && (
          <FillBody ex={ex} text={text} setText={setText} locked={locked} onSubmit={check} showNl={showNl} />
        )}
        {ex.type === 'build' && (
          <BuildBody ex={ex} bank={bank} picked={picked} setPicked={setPicked} locked={locked} />
        )}
        {ex.type === 'listen' && (
          <ListenBody
            ex={ex}
            choice={choice}
            setChoice={setChoice}
            text={text}
            setText={setText}
            verdict={verdict}
            locked={locked}
          />
        )}
        {ex.type === 'write' && <WriteBody ex={ex} text={text} setText={setText} locked={locked} />}

        {(ex.type === 'fill' || ex.type === 'write' || (ex.type === 'listen' && ex.mode === 'type')) && !locked ? (
          <AccentBar onChar={(c) => setText((t) => t + c)} />
        ) : null}

        {!locked ? (
          <Row style={{ marginTop: 18, flexWrap: 'wrap' }}>
            {hintText ? (
              <IconBtn
                icon="💡"
                label="Hint"
                active={showHint}
                onPress={() => {
                  setShowHint((s) => !s);
                  setUsedHint(true);
                }}
                style={{ marginRight: 8, marginBottom: 8 }}
              />
            ) : null}
            {canTranslate ? (
              <IconBtn
                icon="🌐"
                label="Vertaal"
                active={showNl}
                onPress={() => {
                  setShowNl((s) => !s);
                  setUsedHint(true);
                }}
                style={{ marginBottom: 8 }}
              />
            ) : null}
          </Row>
        ) : null}

        {showHint && hintText && !locked ? (
          <View style={{ backgroundColor: C.amberBg, borderRadius: R.md, padding: 12, marginTop: 4 }}>
            <Rich text={`💡 ${hintText}`} style={{ fontSize: 15, lineHeight: 22 }} />
          </View>
        ) : null}
        {showNl && ex.nl && !locked && ex.type !== 'choice' ? (
          <View style={{ backgroundColor: C.blueBg, borderRadius: R.md, padding: 12, marginTop: 8 }}>
            <Rich text={`🌐 ${ex.nl}`} style={{ fontSize: 15, lineHeight: 22 }} />
          </View>
        ) : null}
        {showNl && ex.type === 'choice' && ex.nl && !locked ? (
          <View style={{ backgroundColor: C.blueBg, borderRadius: R.md, padding: 12, marginTop: 8 }}>
            <Rich text={`🌐 ${ex.nl}`} style={{ fontSize: 15, lineHeight: 22 }} />
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          backgroundColor: tint,
          borderTopWidth: 2,
          borderTopColor: verdict ? 'transparent' : C.line,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12 + insets.bottom,
        }}
      >
        {verdict ? <FeedbackBlock ex={ex} verdict={verdict} /> : null}
        {verdict ? (
          <Btn
            testID="continue"
            label={continueLabel ?? 'Doorgaan'}
            color={verdict.correct ? 'green' : verdict.status === 'almost' ? 'amber' : 'red'}
            onPress={() => onDone({ verdict, hint: usedHint })}
          />
        ) : (
          <Btn testID="check" label="Controleer" disabled={!hasAnswer} onPress={check} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ---------- Onderdelen ----------

export function NpcLine({ es, nl }: { es: string; nl: string }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
      <SpeakBtn text={es} size={44} />
      <View
        style={{
          flex: 1,
          marginLeft: 10,
          backgroundColor: C.white,
          borderRadius: R.md,
          borderWidth: 2,
          borderColor: C.line,
          padding: 12,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.ink }}>{es}</Text>
        <Pressable onPress={() => setShow((s) => !s)} style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 14, color: show ? C.ink2 : C.blueDark, fontWeight: '700' }}>
            {show ? nl : '🌐 Toon vertaling'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function OptionBtn({
  label,
  sub,
  selected,
  state,
  onPress,
  disabled,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  state: 'idle' | 'good' | 'bad' | 'dim';
  onPress: () => void;
  disabled: boolean;
}) {
  const border = state === 'good' ? C.green : state === 'bad' ? C.red : selected ? C.blue : C.line;
  const bg = state === 'good' ? C.greenBg : state === 'bad' ? C.redBg : selected ? C.blueBg : C.white;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 2,
        borderBottomWidth: 4,
        borderRadius: R.md,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
        opacity: state === 'dim' ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ fontSize: 18, color: C.ink, fontWeight: selected || state === 'good' ? '800' : '600' }}>{label}</Text>
      {sub ? <Text style={{ fontSize: 14, color: C.ink2, marginTop: 3 }}>{sub}</Text> : null}
    </Pressable>
  );
}

function ChoiceBody({
  ex,
  choice,
  setChoice,
  verdict,
  showNl,
}: {
  ex: Extract<Exercise, { type: 'choice' }>;
  choice: number | null;
  setChoice: (n: number) => void;
  verdict: Verdict | null;
  showNl: boolean;
}) {
  const spanishPrompt = ex.promptLang === 'es';
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        {ex.speak || spanishPrompt ? (
          <View style={{ marginRight: 10 }}>
            <SpeakBtn text={ex.speak ?? ex.prompt} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Rich text={ex.prompt} style={{ fontSize: 20, lineHeight: 28, fontWeight: '700' }} />
        </View>
      </View>
      {ex.options.map((o, i) => {
        let state: 'idle' | 'good' | 'bad' | 'dim' = 'idle';
        if (verdict) {
          if (i === ex.answer) state = 'good';
          else if (i === choice) state = 'bad';
          else state = 'dim';
        }
        return (
          <OptionBtn
            key={i}
            label={o}
            sub={showNl && ex.optionsNl ? ex.optionsNl[i] : undefined}
            selected={choice === i}
            state={state}
            disabled={!!verdict}
            onPress={() => setChoice(i)}
          />
        );
      })}
    </View>
  );
}

function InputBox({
  value,
  onChange,
  locked,
  multiline,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (t: string) => void;
  locked: boolean;
  multiline?: boolean;
  onSubmit?: () => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      testID="answer-input"
      value={value}
      onChangeText={onChange}
      editable={!locked}
      multiline={multiline}
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
      autoComplete="off"
      importantForAutofill="no"
      placeholder={placeholder ?? 'Typ je antwoord...'}
      placeholderTextColor="#A9A494"
      returnKeyType={multiline ? 'default' : 'done'}
      onSubmitEditing={multiline ? undefined : onSubmit}
      style={{
        backgroundColor: C.white,
        borderWidth: 2,
        borderBottomWidth: 4,
        borderColor: C.line,
        borderRadius: R.md,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 20,
        color: C.ink,
        minHeight: multiline ? 96 : 56,
        textAlignVertical: multiline ? 'top' : 'center',
      }}
    />
  );
}

function FillBody({
  ex,
  text,
  setText,
  locked,
  onSubmit,
  showNl,
}: {
  ex: Extract<Exercise, { type: 'fill' }>;
  text: string;
  setText: (t: string) => void;
  locked: boolean;
  onSubmit: () => void;
  showNl: boolean;
}) {
  const [before, after] = ex.sentence.split('___');
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ marginRight: 10 }}>
          <SpeakBtn text={ex.sentence} />
        </View>
        <Text style={{ flex: 1, fontSize: 21, lineHeight: 32, fontWeight: '700', color: C.ink }}>
          {before}
          <Text
            style={{
              color: C.blueDark,
              backgroundColor: C.blueBg,
              fontWeight: '800',
            }}
          >
            {text ? ` ${text} ` : ' ______ '}
          </Text>
          {after}
        </Text>
      </View>
      {ex.base ? (
        <View style={{ alignSelf: 'flex-start', backgroundColor: C.purpleBg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 12 }}>
          <Text style={{ color: C.purpleDark, fontWeight: '800', fontSize: 14 }}>{ex.base}</Text>
        </View>
      ) : null}
      {showNl && ex.nl ? <Text style={{ fontSize: 14, color: C.ink2, marginBottom: 10 }}>{ex.nl}</Text> : null}
      <InputBox value={text} onChange={setText} locked={locked} onSubmit={onSubmit} placeholder="Typ het ontbrekende woord..." />
    </View>
  );
}

function WriteBody({
  ex,
  text,
  setText,
  locked,
}: {
  ex: Extract<Exercise, { type: 'write' }>;
  text: string;
  setText: (t: string) => void;
  locked: boolean;
}) {
  return (
    <View>
      <View
        style={{
          backgroundColor: C.white,
          borderRadius: R.md,
          borderWidth: 2,
          borderColor: C.line,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Rich text={ex.prompt} style={{ fontSize: 19, lineHeight: 27, fontWeight: '700' }} />
      </View>
      <InputBox value={text} onChange={setText} locked={locked} multiline placeholder="Schrijf in het Spaans..." />
    </View>
  );
}

function ListenBody({
  ex,
  choice,
  setChoice,
  text,
  setText,
  verdict,
  locked,
}: {
  ex: Extract<Exercise, { type: 'listen' }>;
  choice: number | null;
  setChoice: (n: number) => void;
  text: string;
  setText: (t: string) => void;
  verdict: Verdict | null;
  locked: boolean;
}) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 14 }}>
        <SpeakBtn text={ex.es} size={92} />
        <View style={{ width: 16 }} />
        <SpeakBtn text={ex.es} size={60} slow />
      </View>
      {ex.mode === 'choose' ? (
        <View>
          {(ex.options ?? []).map((o, i) => {
            let state: 'idle' | 'good' | 'bad' | 'dim' = 'idle';
            if (verdict) {
              if (i === (ex.answer ?? 0)) state = 'good';
              else if (i === choice) state = 'bad';
              else state = 'dim';
            }
            return (
              <OptionBtn
                key={i}
                label={o}
                selected={choice === i}
                state={state}
                disabled={!!verdict}
                onPress={() => setChoice(i)}
              />
            );
          })}
        </View>
      ) : (
        <InputBox value={text} onChange={setText} locked={locked} multiline placeholder="Typ wat je hoort..." />
      )}
    </View>
  );
}

function BuildBody({
  ex,
  bank,
  picked,
  setPicked,
  locked,
}: {
  ex: Extract<Exercise, { type: 'build' }>;
  bank: { w: string; i: number }[];
  picked: number[];
  setPicked: (f: (p: number[]) => number[]) => void;
  locked: boolean;
}) {
  return (
    <View>
      <View
        style={{
          backgroundColor: C.white,
          borderRadius: R.md,
          borderWidth: 2,
          borderColor: C.line,
          padding: 14,
          marginBottom: 14,
        }}
      >
        <Rich text={ex.prompt} style={{ fontSize: 19, lineHeight: 27, fontWeight: '700' }} />
      </View>
      <View
        style={{
          minHeight: 76,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          paddingVertical: 8,
          borderTopWidth: 2,
          borderBottomWidth: 2,
          borderColor: C.line,
          marginBottom: 16,
        }}
      >
        {picked.map((bi) => (
          <Chip key={bi} label={bank[bi].w} onPress={() => !locked && setPicked((ps) => ps.filter((x) => x !== bi))} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {bank.map((b, bi) => (
          <Chip
            key={bi}
            label={b.w}
            ghost={picked.includes(bi)}
            onPress={() => !locked && !picked.includes(bi) && setPicked((ps) => [...ps, bi])}
          />
        ))}
      </View>
    </View>
  );
}

function Chip({ label, onPress, ghost }: { label: string; onPress: () => void; ghost?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: ghost ? C.line : C.white,
        borderWidth: 2,
        borderBottomWidth: 4,
        borderColor: C.line,
        borderRadius: R.sm,
        paddingVertical: 9,
        paddingHorizontal: 14,
        marginRight: 8,
        marginBottom: 8,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ fontSize: 19, fontWeight: '700', color: ghost ? 'transparent' : C.ink }}>{label}</Text>
    </Pressable>
  );
}

const SPECIAL = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];

function AccentBar({ onChar }: { onChar: (c: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
      {SPECIAL.map((c) => (
        <Pressable
          key={c}
          accessibilityRole="button"
          accessibilityLabel={`Teken ${c}`}
          onPress={() => onChar(c)}
          style={({ pressed }) => ({
            backgroundColor: pressed ? C.blueBg : C.white,
            borderWidth: 2,
            borderBottomWidth: 4,
            borderColor: C.line,
            borderRadius: 10,
            width: 40,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 6,
            marginBottom: 6,
          })}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.ink }}>{c}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function FeedbackBlock({ ex, verdict }: { ex: Exercise; verdict: Verdict }) {
  const good = verdict.correct;
  const almost = verdict.status === 'almost';
  const idx = hashStr(ex.id) % 6;
  const headline = good ? GOOD[idx % GOOD.length] : almost ? '¡Casi!' : BAD[idx % BAD.length];
  const color = good ? C.greenDark : almost ? C.amberDark : C.redDark;
  const spanish = spanishToSpeak(ex, verdict);
  return (
    <ScrollView style={{ maxHeight: 210, marginBottom: 12 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <Mascot size={44} bg={C.white} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color }}>{headline}</Text>
          {verdict.status === 'accent' ? (
            <Rich
              text={`Goed! Let wel op de accenten: **${verdict.expected}**`}
              style={{ fontSize: 15, lineHeight: 22, marginTop: 4 }}
            />
          ) : null}
          {almost ? (
            <Rich text="Bijna goed, let op de spelling." style={{ fontSize: 15, lineHeight: 22, marginTop: 4 }} />
          ) : null}
          {!good ? (
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color }}>JUIST ANTWOORD</Text>
              <Row style={{ marginTop: 2 }}>
                <View style={{ flex: 1 }}>
                  <Rich text={`**${verdict.expected}**`} style={{ fontSize: 18, lineHeight: 25 }} />
                </View>
                {spanish ? <SpeakBtn text={spanish} size={38} /> : null}
              </Row>
            </View>
          ) : spanish && ex.type !== 'listen' ? (
            <Row style={{ marginTop: 6 }}>
              <SpeakBtn text={spanish} size={34} />
              <Text style={{ marginLeft: 8, fontSize: 14, color: C.ink2 }}>Luister nog eens</Text>
            </Row>
          ) : null}
          {verdict.feedback ? (
            <Rich text={verdict.feedback} style={{ fontSize: 15, lineHeight: 22, marginTop: 8 }} />
          ) : null}
          {ex.explain ? <Rich text={ex.explain} style={{ fontSize: 15, lineHeight: 22, marginTop: 8 }} /> : null}
          {ex.nl && (ex.type === 'listen' || ex.type === 'fill' || ex.type === 'choice') ? (
            <Text style={{ fontSize: 14, color: C.ink2, marginTop: 8 }}>🌐 {ex.nl}</Text>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

export { primaryAnswer };
