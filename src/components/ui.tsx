import React from 'react';
import { Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { parseRich } from '../engine/text';
import { speak } from '../speech';
import { useStore } from '../state';
import { C, ColorName, PAIR, R } from '../theme';

// ---------- Knoppen ----------

export function Btn({
  label,
  onPress,
  color = 'green',
  disabled,
  small,
  style,
  testID,
}: {
  label: string;
  onPress?: () => void;
  color?: ColorName;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const [bg, dark] = disabled ? PAIR.gray : PAIR[color];
  const textColor = color === 'white' && !disabled ? C.ink : C.white;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderBottomWidth: pressed ? 1 : 4,
          borderBottomColor: dark,
          borderRadius: R.md,
          paddingVertical: small ? 9 : 14,
          paddingHorizontal: small ? 14 : 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: pressed ? 3 : 0,
          marginBottom: pressed ? 0 : 0,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: disabled ? '#8D8878' : textColor,
          fontWeight: '800',
          fontSize: small ? 14 : 16,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function IconBtn({
  icon,
  label,
  onPress,
  active,
  style,
}: {
  icon: string;
  label?: string;
  onPress: () => void;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label || icon}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: active ? C.blue : C.line,
          backgroundColor: active ? C.blueBg : C.white,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      {label ? (
        <Text style={{ marginLeft: 6, fontSize: 14, fontWeight: '700', color: C.ink }}>{label}</Text>
      ) : null}
    </Pressable>
  );
}

// ---------- Tekst ----------

export function Rich({
  text,
  style,
  boldStyle,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  boldStyle?: StyleProp<TextStyle>;
}) {
  const clean = text.replace(/^- /gm, '• ');
  const segs = parseRich(clean);
  return (
    <Text style={[{ fontSize: 17, lineHeight: 25, color: C.ink }, style]}>
      {segs.map((s, i) =>
        s.b ? (
          <Text key={i} style={[{ fontWeight: '800' }, boldStyle]}>
            {s.t}
          </Text>
        ) : (
          <Text key={i}>{s.t}</Text>
        ),
      )}
    </Text>
  );
}

export function H({ children, size = 22, style }: { children: React.ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontSize: size, fontWeight: '800', color: C.ink }, style]}>{children}</Text>;
}

export function Muted({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontSize: 14, color: C.ink2, lineHeight: 20 }, style]}>{children}</Text>;
}

// ---------- Vlakken ----------

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          backgroundColor: C.card,
          borderRadius: R.lg,
          borderWidth: 2,
          borderColor: C.line,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Pill({ children, bg = C.amberBg, color = C.ink, style }: { children: React.ReactNode; bg?: string; color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        { backgroundColor: bg, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
        style,
      ]}
    >
      <Text style={{ color, fontWeight: '800', fontSize: 14 }}>{children}</Text>
    </View>
  );
}

export function ProgressBar({ value, color = C.green, height = 14 }: { value: number; color?: string; height?: number }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: C.line, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(v * 100)}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

export function Mascot({ size = 56, bg = C.amberBg }: { size?: number; bg?: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.58 }}>🦜</Text>
    </View>
  );
}

// ---------- Audio ----------

export function SpeakBtn({ text, size = 44, slow }: { text: string; size?: number; slow?: boolean }) {
  const { p } = useStore();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={slow ? 'Langzaam afspelen' : 'Afspelen'}
      onPress={() => speak(text, slow ? 'langzaam' : p.settings.rate)}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: slow ? C.tealDark : C.blue,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ fontSize: size * 0.5 }}>{slow ? '🐢' : '🔊'}</Text>
    </Pressable>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}
