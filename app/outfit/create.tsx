import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useWardrobe, useOutfits } from '../../hooks/useWardrobe';
import { Thumb } from '../../components/ui';
import { Category, CATEGORY_META } from '../../lib/types';

const CATS = Object.keys(CATEGORY_META) as Category[];

export default function CreateOutfitScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items } = useWardrobe();
  const { saveOutfit } = useOutfits();
  const [selected, setSelected] = useState<string[]>([]);
  const [cat, setCat] = useState<Category>('vetements');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  const pool = items.filter(i => i.category === cat);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await saveOutfit(name.trim(), selected, date || undefined);
    setSaving(false);
    router.back();
  }

  const selItems = selected.map(id => items.find(i => i.id === id)).filter(Boolean) as typeof items;

  return (
    <View style={{ flex: 1, backgroundColor: theme.cream }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Header */}
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.paper, alignItems: 'center', justifyContent: 'center', ...theme.shadow }}>
            <Ionicons name="chevron-down" size={22} color={theme.ink} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontFamily: 'Newsreader_500Medium', color: theme.ink }}>Composer une tenue</Text>
        </View>

        {/* Preview board */}
        <View style={{ marginHorizontal: 20, backgroundColor: theme.paper, borderRadius: 24, padding: 16, minHeight: 220, ...theme.shadow }}>
          {selected.length === 0
            ? (
              <View style={{ height: 188, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Ionicons name="sparkles-outline" size={30} color={theme.ink3} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.ink3 }}>Pioche des pièces ci-dessous</Text>
              </View>
            )
            : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {selItems.map(item => (
                  <View key={item.id} style={{ position: 'relative', width: selected.length === 1 ? '100%' : '47%' }}>
                    <Thumb
                      tint={item.category === 'maquillage' || item.category === 'bijoux' ? 'pink' : 'orange'}
                      radius={14}
                      style={{ width: '100%', aspectRatio: 1 }}
                    />
                    <TouchableOpacity
                      onPress={() => toggle(item.id)}
                      activeOpacity={0.8}
                      style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(32,30,31,0.7)', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Ionicons name="close" size={13} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(252,250,246,0.9)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 9.5, fontWeight: '700', color: theme.ink }}>{item.brand}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )
          }
        </View>

        {/* Name + date */}
        <View style={{ paddingHorizontal: 20, marginTop: 16, flexDirection: 'row', gap: 11 }}>
          <View style={{ flex: 1, backgroundColor: theme.paper, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, ...theme.shadow }}>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: theme.ink3, marginBottom: 4 }}>Nom de la tenue</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Sans titre"
              placeholderTextColor={theme.ink3}
              style={{ fontSize: 14, fontWeight: '600', color: theme.ink }}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.75}
            style={{ backgroundColor: theme.paper, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 11, alignItems: 'center', gap: 3, ...theme.shadow }}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.orange} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.orange }}>Planifier</Text>
          </TouchableOpacity>
        </View>

        {/* Category picker */}
        <View style={{ paddingTop: 20, paddingBottom: 4 }}>
          <Text style={{ fontSize: 19, fontFamily: 'Newsreader_500Medium', color: theme.ink, paddingHorizontal: 20, marginBottom: 12 }}>Ajouter des pièces</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            {CATS.map(c => {
              const meta = CATEGORY_META[c];
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCat(c)}
                  activeOpacity={0.75}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 11, backgroundColor: cat === c ? theme.ink : theme.paper, ...((cat !== c) ? theme.shadow : {}) }}
                >
                  <Ionicons
                    name={c === 'chaussures' ? 'footsteps-outline' : c === 'maquillage' ? 'color-palette-outline' : c === 'bijoux' ? 'diamond-outline' : 'shirt-outline'}
                    size={16}
                    color={cat === c ? theme.cream : theme.ink2}
                  />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: cat === c ? theme.cream : theme.ink2 }}>{meta.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Items horizontal scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingTop: 14 }}>
          {pool.length === 0
            ? (
              <View style={{ width: 120, height: 160, borderWidth: 2, borderColor: theme.line2, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Ionicons name="add" size={22} color={theme.ink3} />
                <Text style={{ fontSize: 12, color: theme.ink3, fontWeight: '600', textAlign: 'center' }}>Ajoute d'abord des pièces</Text>
              </View>
            )
            : pool.map(item => {
              const on = selected.includes(item.id);
              return (
                <TouchableOpacity key={item.id} onPress={() => toggle(item.id)} activeOpacity={0.8} style={{ width: 116 }}>
                  <View style={{ position: 'relative' }}>
                    <Thumb
                      tint={item.category === 'maquillage' || item.category === 'bijoux' ? 'pink' : 'orange'}
                      radius={16}
                      style={{ width: 116, height: 140, borderWidth: on ? 3 : 0, borderColor: theme.orange }}
                    />
                    {on && (
                      <View style={{ position: 'absolute', top: 7, right: 7, width: 24, height: 24, borderRadius: 12, backgroundColor: theme.orange, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text numberOfLines={2} style={{ fontSize: 11.5, fontWeight: '600', marginTop: 6, lineHeight: 15, color: theme.ink }}>{item.name}</Text>
                </TouchableOpacity>
              );
            })
          }
        </ScrollView>
      </ScrollView>

      {/* Save */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || selected.length === 0 || !name.trim()}
          activeOpacity={0.85}
          style={{ backgroundColor: selected.length > 0 && name.trim() ? theme.ink : theme.surfaceSunken, borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {saving
            ? <ActivityIndicator color={theme.cream} />
            : <>
                <Ionicons name="checkmark" size={18} color={selected.length > 0 && name.trim() ? theme.cream : theme.ink3} />
                <Text style={{ fontWeight: '700', fontSize: 14.5, color: selected.length > 0 && name.trim() ? theme.cream : theme.ink3 }}>
                  Enregistrer la tenue ({selected.length})
                </Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}
