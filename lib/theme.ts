export type ThemeKey = 'creme' | 'nuit';

const shared = {
  orange: '#FC850F',
  pink: '#FFA6DA',
  orangeLine: 'rgba(252,133,15,0.30)',
  pinkLine: 'rgba(255,166,218,0.55)',
};

export const THEMES = {
  creme: {
    ...shared,
    key: 'creme' as ThemeKey,
    dark: false,
    ink: '#201E1F',
    cream: '#F1E9E0',
    paper: '#FCFAF6',
    cream2: '#EAE0D4',
    surfaceSunken: '#F6EFE6',
    ink2: 'rgba(32,30,31,0.58)',
    ink3: 'rgba(32,30,31,0.40)',
    line: 'rgba(32,30,31,0.09)',
    line2: 'rgba(32,30,31,0.15)',
    orangeSoft: 'rgba(252,133,15,0.13)',
    pinkSoft: 'rgba(255,166,218,0.24)',
    navBg: 'rgba(252,250,246,0.96)',
    statusBar: 'dark' as const,
    shadow: {
      shadowColor: '#201E1F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 14,
      elevation: 3,
    },
  },
  nuit: {
    ...shared,
    key: 'nuit' as ThemeKey,
    dark: true,
    orangeSoft: 'rgba(252,133,15,0.20)',
    pinkSoft: 'rgba(255,166,218,0.20)',
    ink: '#F4ECE2',
    cream: '#1B1A1A',
    paper: '#262324',
    cream2: '#3A3635',
    surfaceSunken: '#322E2D',
    ink2: 'rgba(244,236,226,0.62)',
    ink3: 'rgba(244,236,226,0.40)',
    line: 'rgba(244,236,226,0.10)',
    line2: 'rgba(244,236,226,0.18)',
    navBg: 'rgba(34,31,32,0.96)',
    statusBar: 'light' as const,
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 6,
    },
  },
} as const;

export type Theme = typeof THEMES[keyof typeof THEMES];
