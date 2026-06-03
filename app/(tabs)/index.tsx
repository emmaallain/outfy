import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCategoryCounts, useOutfits, useFeed } from '../../hooks/useWardrobe';
import { Avatar, SectionHead, Thumb, Eyebrow } from '../../components/ui';
import { CATEGORY_META, Category } from '../../lib/types';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

export default function HomeScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const counts = useCategoryCounts();
  const { outfits } = useOutfits();
  const feed = useFeed();

  const now = new Date();
  const dateStr = `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? '…';

  const cats = (Object.keys(CATEGORY_META) as Category[]);
  const featured = cats[0];
  const rest = cats.slice(1);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.cream }}
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View>
          <Eyebrow theme={theme} style={{ marginBottom: 6 }}>{dateStr}</Eyebrow>
          <Text style={{ fontSize: 30, fontFamily: 'Newsreader_500Medium', color: theme.ink, lineHeight: 34 }}>
            {greeting},{'\n'}{firstName}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.paper, alignItems: 'center', justifyContent: 'center', ...theme.shadow }}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.ink} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.8}>
            <Avatar
              initials={(profile?.username ?? '?')[0].toUpperCase()}
              color={profile?.avatar_color ?? theme.orange}
              size={40}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* CTA hero */}
      <View style={{ paddingHorizontal: 20 }}>
        <TouchableOpacity activeOpacity={0.88} onPress={() => router.push('/outfit/create')}>
          <LinearGradient
            colors={[theme.orange, '#ff9d3d', theme.pink]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 22, overflow: 'hidden', shadowColor: theme.orange, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 8 }}
          >
            {/* Deco circle */}
            <View style={{ position: 'absolute', right: -28, top: -28, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.14)' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)' }}>
                Ce soir dans ton lit
              </Text>
            </View>
            <Text style={{ fontSize: 23, fontFamily: 'Newsreader_500Medium', color: '#fff', lineHeight: 27, marginBottom: 5 }}>
              Compose la tenue de demain
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', maxWidth: 250 }}>
              Pioche dans ta garde-robe, tes bijoux et ton maquillage.
            </Text>
            <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 999, paddingHorizontal: 15, paddingVertical: 9 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.ink }}>Composer une tenue</Text>
              <Ionicons name="arrow-forward" size={14} color={theme.ink} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Mon dressing */}
      <SectionHead title="Mon dressing" action="Tout voir" onAction={() => router.push('/(tabs)/wardrobe')} theme={theme} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {/* Featured wide */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/(tabs)/wardrobe', params: { cat: featured } })}
          style={{ backgroundColor: theme.paper, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, ...theme.shadow }}
        >
          <View style={{
            width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            backgroundColor: theme.orangeSoft,
          }}>
            <Ionicons name="shirt-outline" size={27} color={theme.orange} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 17, color: theme.ink }}>{CATEGORY_META[featured].label}</Text>
            <Text style={{ fontSize: 12, color: theme.ink2 }}>{counts[featured]} pièces</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.ink3} />
        </TouchableOpacity>

        {/* 2-col grid */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {rest.map((cat) => {
            const meta = CATEGORY_META[cat];
            const isPink = meta.tint === 'pink';
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/(tabs)/wardrobe', params: { cat } })}
                style={{ flex: 1, backgroundColor: theme.paper, borderRadius: 20, padding: 15, minHeight: 104, justifyContent: 'space-between', ...theme.shadow }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isPink ? theme.pinkSoft : theme.orangeSoft,
                }}>
                  <Ionicons
                    name={cat === 'chaussures' ? 'footsteps-outline' : cat === 'maquillage' ? 'color-palette-outline' : 'diamond-outline'}
                    size={24}
                    color={isPink ? '#c25a93' : theme.orange}
                  />
                </View>
                <View>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: theme.ink }}>{meta.label}</Text>
                  <Text style={{ fontSize: 12, color: theme.ink2 }}>{counts[cat]} pièces</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Tenues à venir */}
      {outfits.length > 0 && (
        <>
          <SectionHead title="Tenues à venir" action="Planifier" onAction={() => router.push('/outfit/create')} theme={theme} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 13 }}>
            {outfits.map((outfit) => (
              <TouchableOpacity key={outfit.id} activeOpacity={0.8} onPress={() => router.push(`/outfit/create?id=${outfit.id}`)} style={{ width: 168 }}>
                <View style={{ height: 116, borderRadius: 18, overflow: 'hidden', flexDirection: 'row', gap: 3, ...theme.shadow }}>
                  {(outfit.outfit_items ?? []).slice(0, 4).map((_: any, idx: number) => (
                    <Thumb key={idx} tint={idx % 2 === 0 ? 'orange' : 'pink'} style={{ flex: 1 }} />
                  ))}
                  {!outfit.outfit_items?.length && <Thumb tint="orange" style={{ flex: 1 }} />}
                </View>
                <Text style={{ marginTop: 8, fontWeight: '600', fontSize: 13.5, color: theme.ink }}>{outfit.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Ionicons name="calendar-outline" size={12} color={theme.ink3} />
                  <Text style={{ fontSize: 11.5, color: theme.ink2 }}>{outfit.date ?? 'Sans date'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Le fil des amies */}
      {feed.length > 0 && (
        <>
          <SectionHead title="Le fil de tes amies" action="Voir tout" onAction={() => router.push('/(tabs)/profile')} theme={theme} />
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {feed.slice(0, 5).map((activity: any) => (
              <View key={activity.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.paper, borderRadius: 18, padding: 11, ...theme.shadow }}>
                <Avatar
                  initials={(activity.profile?.username ?? '?')[0].toUpperCase()}
                  color={activity.profile?.avatar_color ?? theme.pink}
                  size={42}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 13.5, lineHeight: 19, color: theme.ink }} numberOfLines={2}>
                    <Text style={{ fontWeight: '700' }}>{activity.profile?.username}</Text>
                    <Text style={{ color: theme.ink2 }}> {activity.action}</Text>
                  </Text>
                  {activity.item && (
                    <Text style={{ fontWeight: '600', fontSize: 13.5, color: theme.ink }} numberOfLines={1}>{activity.item.name}</Text>
                  )}
                  <Text style={{ fontSize: 11, color: theme.ink3, marginTop: 1 }}>
                    {formatDate(activity.created_at)}
                  </Text>
                </View>
                <Thumb tint="pink" radius={12} style={{ width: 48, height: 48, flexShrink: 0 }} />
              </View>
            ))}
          </View>
        </>
      )}

      {/* Empty state quand pas d'amies */}
      {feed.length === 0 && (
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <SectionHead title="Le fil de tes amies" theme={theme} />
          <View style={{ backgroundColor: theme.paper, borderRadius: 20, padding: 24, alignItems: 'center', gap: 10, ...theme.shadow }}>
            <Ionicons name="people-outline" size={36} color={theme.ink3} />
            <Text style={{ fontSize: 14, color: theme.ink2, textAlign: 'center', lineHeight: 20 }}>
              Invite tes amies pour voir leur garde-robe ici.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3600_000) return 'il y a ' + Math.floor(diff / 60_000) + ' min';
  if (diff < 86400_000) return 'il y a ' + Math.floor(diff / 3600_000) + 'h';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
