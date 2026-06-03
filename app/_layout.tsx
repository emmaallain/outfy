import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  HankenGrotesk_400Regular,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import {
  Newsreader_400Regular,
  Newsreader_500Medium,
} from '@expo-google-fonts/newsreader';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

function RootNav() {
  const { session, loading } = useAuth();
  const { theme } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!session && !inAuth) router.replace('/(auth)/login');
    else if (session && inAuth) router.replace('/(tabs)');
  }, [session, loading]);

  return (
    <>
      <StatusBar style={theme.statusBar} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="item/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="item/add" options={{ presentation: 'modal' }} />
        <Stack.Screen name="outfit/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="friend/[id]" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    Newsreader_400Regular,
    Newsreader_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <RootNav />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
