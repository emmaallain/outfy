import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useWardrobe, useWishlist } from '../../hooks/useWardrobe';
import { ItemCard, RoundBtn } from '../../components/ui';
import { CATEGORY_META, Category, OCCASIONS } from '../../lib/types';

const CATS = Object.keys(CATEGORY_META) as Category[];

export default function WardrobeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cat: initCat } = useLocalSearchParams<{ cat?: Category }>();

  const [tab, setTab] = useState<'pieces' | 'wishlist'>('pieces');
  const [activeCat, setActiveCat] = useState<Category | 'tout'>('tout');
  const [occ, setOcc] = useState('Tout');

  const { items, loading } = useWardrobe();
  const { items: wishlist } = useWishlist();

  const filtered = items.filter(i =>
    (activeCat === 'tout' || i.category === activeCat) &&
    (occ === 'Tout' || (i.occasions ?? []).includes(occ as any))
  );

  const itemsByCat = CATS.reduce((acc, cat) => {
    acc[cat] = filtered.filter(i => i.category === cat);
    return acc;
  }, {} as Record<Category, typeof items>);

  const occs = ['Tout', ...OCCASIONS.map(o => o.label)];

  return (
    <View style={{ flex: 1, backgroundColor: theme.cream }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Header */}
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ fontSize: 30, fontFamily: 'Newsreader_500Medium', color: theme.ink }}>Mon dressing</Text>
            <View style={{ flexDirection: 'row', gap: 9 }}>
              <RoundBtn icon="search-outline" theme={theme} />
              <RoundBtn icon="options-outline" theme={theme} />
            </View>
          </View>

          {/* Tabs */}
          <View style={{ flexDirection: 'row', backgroundColor: theme.surfaceSunken, borderRadius: 14, padding: 4 }}>
            {(['pieces', 'wishlist'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                activeOpacity={0.75}
                style={{
                  flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: 'center',
                  flexDirection: 'row', justifyContent: 'center', gap: 6,
                  backgroundColor: tab === t ? theme.paper : 'transparent',
                  ...((tab === t) ? theme.shadow : {}),
                }}
              >
                {t === 'wishlist' && <Ionicons name="heart-outline" size={15} color={tab === t ? theme.ink : theme.ink2} />}
                <Text style={{ fontSize: 13.5, fontWeight: '700', color: tab === t ? theme.ink : theme.ink2 }}>
                  {t === 'pieces' ? 'Mes pièces' : 'Wishlist'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {tab === 'pieces' ? (
          <>
            {/* Category type filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingTop: 14, paddingBottom: 4 }}>
              {([['tout', 'Tout'] as const, ...CATS.map(c => [c, CATEGORY_META[c].label] as const)]).map(([id, label]) => (
                <TouchableOpacity
                  key={id}
                  onPress={() => setActiveCat(id)}
                  activeOpacity={0.75}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
                    backgroundColor: activeCat === id ? theme.orange : theme.paper,
                    ...((activeCat !== id) ? theme.shadow : {}),
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: activeCat === id ? '#fff' : theme.ink2 }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Occasion filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 10 }}>
              {occs.map(o => (
                <TouchableOpacity
                  key={o}
                  onPress={() => setOcc(o)}
                  activeOpacity={0.75}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
                    backgroundColor: occ === o ? theme.ink : theme.paper,
                    ...((occ !== o) ? theme.shadow : {}),
                  }}
                >
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: occ === o ? theme.cream : theme.ink2 }}>
                    {o}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Items by category */}
            {CATS.map(cat => {
              const catItems = itemsByCat[cat];
              if (!catItems.length) return null;
              const meta = CATEGORY_META[cat];
              const isPink = meta.tint === 'pink';
              return (
                <View key={cat} style={{ marginTop: 18 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 11 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                      <Ionicons
                        name={cat === 'chaussures' ? 'footsteps-outline' : cat === 'maquillage' ? 'color-palette-outline' : cat === 'bijoux' ? 'diamond-outline' : 'shirt-outline'}
                        size={19}
                        color={isPink ? '#c25a93' : theme.orange}
                      />
                      <Text style={{ fontWeight: '700', fontSize: 15.5, color: theme.ink }}>{meta.label}</Text>
                      <Text style={{ fontSize: 12, color: theme.ink3, fontWeight: '600' }}>{catItems.length}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 13 }}>
                    {catItems.map(item => (
                      <View key={item.id} style={{ width: '46.5%' }}>
                        <ItemCard
                          item={item}
                          theme={theme}
                          onPress={() => router.push(`/item/${item.id}`)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            {/* Empty state */}
            {items.length === 0 && !loading && (
              <View style={{ padding: 40, alignItems: 'center', gap: 12 }}>
                <Ionicons name="shirt-outline" size={48} color={theme.ink3} />
                <Text style={{ fontSize: 16, color: theme.ink2, textAlign: 'center' }}>
                  Ton dressing est vide.{'\n'}Commence par scanner une pièce !
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/scan')}
                  style={{ backgroundColor: theme.orange, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 13, shadowColor: theme.orange, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 }}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Scanner une pièce</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={{ padding: 16 }}>
            <View style={{ backgroundColor: theme.pinkSoft, borderRadius: 18, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="heart" size={22} color={theme.pink} />
              <Text style={{ fontSize: 13, color: '#9a3b73', fontWeight: '600', flex: 1 }}>
                Tes prochains coups de cœur. Garde le lien et la taille au même endroit.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 13 }}>
              {wishlist.map(item => (
                <View key={item.id} style={{ width: '46.5%' }}>
                  <ItemCard item={item} theme={theme} onPress={() => router.push(`/item/${item.id}`)} />
                </View>
              ))}
              <TouchableOpacity
                onPress={() => router.push('/item/add?wishlist=true')}
                style={{ width: '46.5%', minHeight: 200, borderWidth: 2, borderColor: theme.line2, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 8 }}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={26} color={theme.ink2} />
                <Text style={{ fontWeight: '700', fontSize: 13, color: theme.ink2 }}>Ajouter un souhait</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB add */}
      {tab === 'pieces' && (
        <TouchableOpacity
          onPress={() => router.push('/item/add')}
          style={{ position: 'absolute', bottom: 96 + insets.bottom, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.orange, alignItems: 'center', justifyContent: 'center', shadowColor: theme.orange, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}
