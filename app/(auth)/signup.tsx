import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function SignupScreen() {
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);

  async function handleSignup() {
    setError('');
    if (!username.trim()) { setError('Choisis un nom d\'utilisateur.'); return; }
    setLoading(true);
    const err = await signUp(email.trim(), password, username.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setShowEmailSent(true);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.cream }}>
      {/* Email envoyé popup */}
      <Modal visible={showEmailSent} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 28 }}>
          <View style={{ backgroundColor: theme.paper, borderRadius: 24, padding: 28, alignItems: 'center', gap: 14, width: '100%' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.orangeSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="mail-outline" size={32} color={theme.orange} />
            </View>
            <Text style={{ fontSize: 22, fontFamily: 'Newsreader_500Medium', color: theme.ink, textAlign: 'center' }}>
              Email envoyé !
            </Text>
            <Text style={{ fontSize: 14, color: theme.ink2, textAlign: 'center', lineHeight: 21 }}>
              Un lien de confirmation a été envoyé à{'\n'}
              <Text style={{ fontWeight: '700', color: theme.ink }}>{email}</Text>.{'\n\n'}
              Consulte ta boîte mail et clique sur le lien pour activer ton compte.
            </Text>
            <TouchableOpacity
              onPress={() => { setShowEmailSent(false); router.replace('/(auth)/login'); }}
              activeOpacity={0.85}
              style={{ backgroundColor: theme.orange, borderRadius: 14, paddingVertical: 14, width: '100%', alignItems: 'center', shadowColor: theme.orange, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5, marginTop: 4 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Compris, aller à la connexion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flex: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
            <Text style={{ color: theme.orange, fontWeight: '700', fontSize: 15 }}>← Retour</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 30, fontFamily: 'Newsreader_500Medium', color: theme.ink, marginBottom: 8 }}>
            Créer un compte
          </Text>
          <Text style={{ fontSize: 14, color: theme.ink2, marginBottom: 32 }}>
            Rejoint Outfy et commence à composer tes tenues.
          </Text>

          <View style={{ gap: 12 }}>
            <TextInput
              style={{ backgroundColor: theme.paper, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: theme.ink, ...theme.shadow }}
              placeholder="Nom d'utilisateur"
              placeholderTextColor={theme.ink3}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={{ backgroundColor: theme.paper, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: theme.ink, ...theme.shadow }}
              placeholder="Email"
              placeholderTextColor={theme.ink3}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={{ backgroundColor: theme.paper, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: theme.ink, ...theme.shadow }}
              placeholder="Mot de passe"
              placeholderTextColor={theme.ink3}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error ? <Text style={{ color: '#e53e3e', fontSize: 13, textAlign: 'center' }}>{error}</Text> : null}
            <TouchableOpacity
              style={{ backgroundColor: theme.orange, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4, shadowColor: theme.orange, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 6 }}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Créer mon compte</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
