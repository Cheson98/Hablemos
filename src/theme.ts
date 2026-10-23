export const C = {
  bg: '#FFF8EC',
  card: '#FFFFFF',
  ink: '#2B2A33',
  ink2: '#6B6A7A',
  line: '#EADFCB',
  white: '#FFFFFF',
  green: '#2DB36F',
  greenDark: '#1F8A52',
  greenBg: '#DDF6E8',
  red: '#E5484D',
  redDark: '#B83237',
  redBg: '#FFE3E3',
  amber: '#FFC53D',
  amberDark: '#D99B00',
  amberBg: '#FFF1CC',
  orange: '#FF8A3D',
  orangeDark: '#D96A1F',
  blue: '#3E8EF7',
  blueDark: '#2467C4',
  blueBg: '#E2EEFF',
  purple: '#8B5CF6',
  purpleDark: '#6A3FD1',
  purpleBg: '#EEE8FF',
  teal: '#14B8A6',
  tealDark: '#0E8F82',
  pink: '#F0599B',
  pinkDark: '#C13C7A',
  locked: '#DCD6C8',
  lockedDark: '#BDB6A4',
};

export type ColorName = 'green' | 'red' | 'amber' | 'orange' | 'blue' | 'purple' | 'teal' | 'pink' | 'gray' | 'white';

export const PAIR: Record<ColorName, [string, string]> = {
  green: [C.green, C.greenDark],
  red: [C.red, C.redDark],
  amber: [C.amber, C.amberDark],
  orange: [C.orange, C.orangeDark],
  blue: [C.blue, C.blueDark],
  purple: [C.purple, C.purpleDark],
  teal: [C.teal, C.tealDark],
  pink: [C.pink, C.pinkDark],
  gray: [C.locked, C.lockedDark],
  white: [C.white, C.line],
};

const LEVEL_ORDER: ColorName[] = ['orange', 'blue', 'green', 'purple', 'pink', 'teal', 'red', 'amber', 'blue', 'orange', 'purple', 'green'];

export function levelColor(n: number): ColorName {
  return LEVEL_ORDER[(n - 1) % LEVEL_ORDER.length];
}

export const R = { sm: 12, md: 16, lg: 22 };
