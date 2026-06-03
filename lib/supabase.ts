import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isWeb = Platform.OS === 'web';
const hasWindow = typeof window !== 'undefined';

const webStorage = {
  getItem: async (key: string) => {
    if (!hasWindow) return null;
    return window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (!hasWindow) return;
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (!hasWindow) return;
    window.localStorage.removeItem(key);
  },
};

const authStorage = isWeb ? webStorage : AsyncStorage;
const persistSession = !isWeb || hasWindow;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession,
    detectSessionInUrl: false,
  },
});
