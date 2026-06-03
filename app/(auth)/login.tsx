import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    const err = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  }

  const s = styles(theme);

  return (
    <View style={{ flex: 1, backgroundColor: theme.cream }}>
      <LinearGradient
        colors={[theme.orange + '22', theme.pink + '11', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320 }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <Text style={s.logo}>Outfy</Text>
            <Text style={s.tagline}>Ta garde-robe dans ta poche.</Text>
          </View>

          <View style={s.form}>
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor={theme.ink3}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={s.input}
              placeholder="Mot de passe"
              placeholderTextColor={theme.ink3}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error ? <Text style={s.error}>{error}</Text> : null}
            <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Se connecter</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={{ marginTop: 20 }}>
            <Text style={{ color: theme.ink2, fontSize: 14, textAlign: 'center' }}>
              Pas encore de compte ? <Text style={{ color: theme.orange, fontWeight: '700' }}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 100, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 42, fontFamily: 'Newsreader_500Medium', color: theme.ink, letterSpacing: -1 },
  tagline: { fontSize: 16, color: theme.ink2, marginTop: 8, fontWeight: '400' },
  form: { gap: 12 },
  input: {
    backgroundColor: theme.paper,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: theme.ink,
    ...theme.shadow,
  },
  error: { color: '#e53e3e', fontSize: 13, textAlign: 'center' },
  btn: {
    backgroundColor: theme.orange,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: theme.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
