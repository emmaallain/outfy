import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../hooks/useWardrobe';
import { Avatar, ItemCard, RoundBtn } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'wardrobe' | 'friends'>('wardrobe');
  const { items } = useWardrobe();
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('friendships')
      .select('*, friend:profiles!friendships_friend_id_fkey(*)')
      .eq('user_id', profile.id)
      .eq('status', 'accepted')
      .then(({ data }) => setFriends(data ?? []));
  }, [profile]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.cream }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}>
          <View style={{ alignItems: 'flex-end' }}>
            <RoundBtn icon="settings-outline" theme={theme} onPress={signOut} />
          </View>

          {/* Avatar + stats */}
          <View style={{ alignItems: 'center', marginTop: -4 }}>
            <Avatar
              initials={(profile?.username ?? '?')[0].toUpperCase()}
              color={profile?.avatar_color ?? theme.orange}
              size={84}
            />
            <Text style={{ fontSize: 25, fontFamily: 'Newsreader_500Medium', color: theme.ink, marginTop: 12, marginBottom: 2 }}>
              {profile?.full_name ?? profile?.username}
            </Text>
            <Text style={{ fontSize: 13, color: theme.ink2, fontWeight: '600' }}>@{profile?.username}</Text>

            <View style={{ flexDirection: 'row', gap: 26, marginTop: 16, marginBottom: 18 }}>
              {[
                [items.length, 'pièces'],
                [0, 'tenues'],
                [friends.length, 'ami·es'],
              ].map(([n, l]) => (
                <View key={String(l)} style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 21, fontFamily: 'Newsreader_500Medium', color: theme.ink }}>{n}</Text>
                  <Text style={{ fontSize: 11.5, color: theme.ink2, fontWeight: '600' }}>{l}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: theme.orange, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 12, shadowColor: theme.orange, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 5 }}
            >
              <Ionicons name="share-outline" size={17} color="#fff" />
              <Text style={{ fontWeight: '700', fontSize: 14, color: '#fff' }}>Partager ma garde-robe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 4, backgroundColor: theme.surfaceSunken, borderRadius: 14, padding: 4, margin: '4%', marginTop: 22 }}>
          {([['wardrobe', 'Ma garde-robe'], ['friends', 'Mes ami·es']] as const).map(([id, label]) => (
            <TouchableOpacity
              key={id}
              onPress={() => setTab(id)}
              activeOpacity={0.75}
              style={{ flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: 'center', backgroundColor: tab === id ? theme.paper : 'transparent', ...((tab === id) ? theme.shadow : {}) }}
            >
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: tab === id ? theme.ink : theme.ink2 }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'wardrobe' ? (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 13 }}>
              {items.slice(0, 6).map(item => (
                <View key={item.id} style={{ width: '46.5%' }}>
                  <ItemCard item={item} theme={theme} onPress={() => router.push(`/item/${item.id}`)} />
                </View>
              ))}
            </View>
            {items.length > 6 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/wardrobe')}
                style={{ marginTop: 14, paddingVertical: 13, borderRadius: 14, backgroundColor: theme.paper, alignItems: 'center', ...theme.shadow }}
                activeOpacity={0.75}
              >
                <Text style={{ fontWeight: '700', fontSize: 14, color: theme.ink }}>Voir tout le dressing ({items.length} pièces)</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 12.5, color: theme.ink2, marginBottom: 14, lineHeight: 19 }}>
              Seul·es tes ami·es peuvent consulter ta garde-robe — et toi la leur. Confidentiel par défaut.
            </Text>
            <View style={{ gap: 11 }}>
              {friends.map(f => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => router.push(`/friend/${f.friend?.id}`)}
                  activeOpacity={0.8}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: theme.paper, borderRadius: 18, padding: 12, ...theme.shadow }}
                >
                  <Avatar
                    initials={(f.friend?.username ?? '?')[0].toUpperCase()}
                    color={f.friend?.avatar_color ?? theme.pink}
                    size={46}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14.5, color: theme.ink }}>{f.friend?.full_name ?? f.friend?.username}</Text>
                    <Text style={{ fontSize: 12, color: theme.ink2 }}>@{f.friend?.username}</Text>
                  </View>
                  <View style={{ backgroundColor: theme.pinkSoft, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#9a3b73' }}>Voir le dressing</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Invite */}
              <TouchableOpacity
                activeOpacity={0.75}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderColor: theme.line2, borderRadius: 18, padding: 12, borderStyle: 'dashed' }}
              >
                <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: theme.surfaceSunken, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="person-add-outline" size={22} color={theme.ink2} />
                </View>
                <Text style={{ fontWeight: '700', fontSize: 14, color: theme.ink2 }}>Inviter un·e ami·e</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
