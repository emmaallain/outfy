import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Avatar, ItemCard } from '../../components/ui';
import { Item, Profile } from '../../lib/types';

export default function FriendScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase.from('profiles').select('*').eq('id', id).single().then(({ data }) => setProfile(data));
    supabase.from('items').select('*').eq('user_id', id).eq('is_wishlist', false).order('created_at', { ascending: false }).then(({ data }) => setItems(data ?? []));
  }, [id]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.cream }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.paper, alignItems: 'center', justifyContent: 'center', ...theme.shadow }}
          >
            <Ionicons name="chevron-back" size={22} color={theme.ink} />
          </TouchableOpacity>
          {profile && (
            <>
              <Avatar initials={(profile.username ?? '?')[0].toUpperCase()} color={(profile as any).avatar_color ?? theme.pink} size={38} />
              <View>
                <Text style={{ fontWeight: '700', fontSize: 16, color: theme.ink }}>{profile.full_name ?? profile.username}</Text>
                <Text style={{ fontSize: 11.5, color: theme.ink2 }}>{items.length} pièces partagées</Text>
              </View>
            </>
          )}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 13 }}>
            {items.map(item => (
              <View key={item.id} style={{ width: '46.5%' }}>
                <ItemCard item={item} theme={theme} showFav={false} onPress={() => router.push(`/item/${item.id}`)} />
              </View>
            ))}
          </View>
          {items.length === 0 && profile && (
            <View style={{ paddingVertical: 40, alignItems: 'center', gap: 12 }}>
              <Ionicons name="shirt-outline" size={40} color={theme.ink3} />
              <Text style={{ fontSize: 14, color: theme.ink2, textAlign: 'center' }}>
                {profile.username} n'a pas encore partagé de pièces.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
