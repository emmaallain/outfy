import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme, Platform, AppState } from 'react-native';
import { LightSensor } from 'expo-sensors';
import { THEMES, Theme, ThemeKey } from '../lib/theme';

// Seuil en lux : en dessous = mode nuit (chambre sombre ~5-30 lux)
const DARK_LUX = 40;

interface ThemeCtx {
  theme: Theme;
  themeKey: ThemeKey;
}

const Ctx = createContext<ThemeCtx>({ theme: THEMES.creme, themeKey: 'creme' });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [key, setKey] = useState<ThemeKey>(system === 'dark' ? 'nuit' : 'creme');
  const sub = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function start() {
      if (Platform.OS === 'android') {
        const available = await LightSensor.isAvailableAsync();
        if (available && mounted) {
          LightSensor.setUpdateInterval(4000);
          sub.current = LightSensor.addListener(({ illuminance }) => {
            setKey(illuminance < DARK_LUX ? 'nuit' : 'creme');
          });
          return;
        }
      }
      // Fallback iOS & Android sans capteur : heure de la journée
      function byTime() {
        const h = new Date().getHours();
        return h >= 7 && h < 20 ? 'creme' : 'nuit';
      }
      setKey(byTime() as ThemeKey);
      // Réévalue toutes les 5 min
      const interval = setInterval(() => { if (mounted) setKey(byTime() as ThemeKey); }, 5 * 60_000);
      sub.current = { remove: () => clearInterval(interval) };
    }

    start();
    const appSub = AppState.addEventListener('change', (s) => {
      if (s === 'active') start();
    });

    return () => {
      mounted = false;
      sub.current?.remove();
      appSub.remove();
    };
  }, []);

  // Suit aussi le système quand pas de capteur
  useEffect(() => {
    if (Platform.OS !== 'android') {
      setKey(system === 'dark' ? 'nuit' : 'creme');
    }
  }, [system]);

  return (
    <Ctx.Provider value={{ theme: THEMES[key], themeKey: key }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
