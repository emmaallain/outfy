import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useWardrobe } from '../../hooks/useWardrobe';
import { Stars, Tag, Thumb, Eyebrow } from '../../components/ui';
import { Item, OCCASIONS } from '../../lib/types';

export default function ItemDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, deleteItem, updateItem } = useWardrobe();
  const [item, setItem] = useState<Item | null>(null);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const found = items.find(i => i.id === id);
    setItem(found ?? null);
    setFav((found?.rating ?? 0) >= 4);
  }, [id, items]);

  if (!item) return <View style={{ flex: 1, backgroundColor: theme.cream }} />;

  const rows: [string, string][] = [
    item.size        ? ['Taille',          item.size]                          : null,
    item.brand       ? ['Marque',          item.brand]                         : null,
    item.collection  ? ['Collection',      item.collection]                    : null,
    item.purchase_year ? ['Année d\'achat', String(item.purchase_year)]        : null,
    item.expiry_date ? ['Expiration',       item.expiry_date]                  : null,
  ].filter(Boolean) as [string, string][];

  async function handleDelete() {
    Alert.alert('Supprimer cette pièce ?', '', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => { await deleteItem(item.id); router.back(); },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.cream }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Photo */}
        <View style={{ width: '100%', height: 420, position: 'relative' }}>
          {item.photo_url
            ? <Image source={{ uri: item.photo_url }} style={{ position: 'absolute', inset: 0 as any, width: '100%', height: '100%' }} resizeMode="cover" />
            : <Thumb
                tint={item.category === 'maquillage' || item.category === 'bijoux' ? 'pink' : 'orange'}
                tag={item.subcategory}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
          }
          {/* Nav overlay */}
          <View style={{ position: 'absolute', top: insets.top + 8, left: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(252,250,246,0.85)', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <Ionicons name="chevron-back" size={22} color={theme.ink} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 9 }}>
              <TouchableOpacity onPress={() => {}} activeOpacity={0.75} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(252,250,246,0.85)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="share-outline" size={20} color={theme.ink} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFav(!fav)}
                activeOpacity={0.75}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(252,250,246,0.85)', alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? theme.pink : theme.ink} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content card */}
        <View style={{ marginTop: -26, backgroundColor: theme.cream, borderRadius: 26, padding: 22 }}>
          <Eyebrow theme={theme} style={{ marginBottom: 7 }}>{item.brand}</Eyebrow>
          <Text style={{ fontSize: 25, fontFamily: 'Newsreader_500Medium', color: theme.ink, lineHeight: 29, marginBottom: 12 }}>
            {item.name}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Stars value={item.rating ?? 0} size={18} theme={theme} />
            {item.rating ? (
              <Text style={{ fontSize: 12.5, color: theme.ink2, fontWeight: '600' }}>
                {item.rating}/5 · {item.rating >= 4 ? 'Je l\'adore' : item.rating >= 3 ? 'Bien' : 'Bof'}
              </Text>
            ) : null}
          </View>

          {/* Occasion tags */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 20 }}>
            {(item.occasions ?? []).map(occ => {
              const meta = OCCASIONS.find(o => o.id === occ);
              return (
                <Tag key={occ} variant={occ === 'soiree' || occ === 'ceremonie' ? 'pink' : ''} theme={theme}>
                  {meta?.label ?? occ}
                </Tag>
              );
            })}
          </View>

          {/* Details rows */}
          {rows.length > 0 && (
            <View style={{ backgroundColor: theme.paper, borderRadius: 20, paddingHorizontal: 16, ...theme.shadow }}>
              {rows.map(([k, v], i) => (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: theme.line }}>
                  <Text style={{ fontSize: 13.5, color: theme.ink2 }}>{k}</Text>
                  <Text style={{ fontSize: 13.5, fontWeight: '600', color: theme.ink }}>{v}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Notes */}
          {item.notes && (
            <View style={{ marginTop: 14, backgroundColor: theme.orangeSoft, borderRadius: 18, padding: 14 }}>
              <Eyebrow theme={theme} style={{ color: '#9a5005', marginBottom: 5 }}>Ma note</Eyebrow>
              <Text style={{ fontSize: 14, lineHeight: 21, color: theme.ink }}>{item.notes}</Text>
            </View>
          )}

          {/* Link */}
          {item.link && (
            <TouchableOpacity activeOpacity={0.8} style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: theme.paper, borderRadius: 16, padding: 13, ...theme.shadow }}>
              <Ionicons name="link-outline" size={18} color={theme.orange} />
              <Text style={{ flex: 1, fontSize: 13.5, fontWeight: '600', color: theme.ink }} numberOfLines={1}>{item.link}</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.ink3} />
            </TouchableOpacity>
          )}

          {/* Actions */}
          <TouchableOpacity
            onPress={() => router.push(`/outfit/create?add=${item.id}`)}
            activeOpacity={0.85}
            style={{ marginTop: 18, backgroundColor: theme.ink, borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Ionicons name="add" size={18} color={theme.cream} />
            <Text style={{ fontWeight: '700', fontSize: 14.5, color: theme.cream }}>Ajouter à une tenue</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => router.push(`/item/add?edit=${item.id}`)}
              activeOpacity={0.75}
              style={{ flex: 1, backgroundColor: theme.paper, borderRadius: 14, paddingVertical: 13, alignItems: 'center', ...theme.shadow }}
            >
              <Text style={{ fontWeight: '700', fontSize: 14, color: theme.ink }}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.75}
              style={{ flex: 1, backgroundColor: theme.pinkSoft, borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}
            >
              <Text style={{ fontWeight: '700', fontSize: 14, color: '#9a3b73' }}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
