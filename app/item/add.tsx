import { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Category, CATEGORY_META, OCCASIONS, Occasion } from '../../lib/types';

const CATS = Object.keys(CATEGORY_META) as Category[];
const LETTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const NUMERIC_SIZES = Array.from({ length: 15 }, (_, i) => String(34 + i));

// Defined outside component to prevent focus loss on re-render
function Field({ label, theme, children }: { label: string; theme: any; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: theme.ink3, letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</Text>
      {children}
    </View>
  );
}

export default function AddItemScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addItem } = useWardrobe();
  const params = useLocalSearchParams<{ name?: string; brand?: string; barcode?: string; image?: string; wishlist?: string }>();

  const [name, setName] = useState(params.name ?? '');
  const [brand, setBrand] = useState(params.brand ?? '');
  const [category, setCategory] = useState<Category>('vetements');
  const [subcategory, setSubcategory] = useState('');
  const [size, setSize] = useState('');
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [customSize, setCustomSize] = useState('');
  const [color, setColor] = useState('');
  const [collection, setCollection] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [purchaseYear, setPurchaseYear] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedOccs, setSelectedOccs] = useState<Occasion[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(params.image ?? null);
  const [loading, setLoading] = useState(false);
  const isWishlist = params.wishlist === 'true';

  function toggleOcc(occ: Occasion) {
    setSelectedOccs(prev => prev.includes(occ) ? prev.filter(o => o !== occ) : [...prev, occ]);
  }

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  }

  async function uploadPhoto(uri: string): Promise<string | null> {
    try {
      const ext = uri.split('.').pop() ?? 'jpg';
      const path = `${user!.id}/${Date.now()}.${ext}`;
      const blob = await fetch(uri).then(r => r.blob());
      const { error } = await supabase.storage.from('item-photos').upload(path, blob, { contentType: `image/${ext}` });
      if (error) return null;
      const { data } = supabase.storage.from('item-photos').getPublicUrl(path);
      return data.publicUrl;
    } catch {
      return null;
    }
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Nom requis', 'Donne un nom à cet article.'); return; }
    setLoading(true);
    let photo_url: string | undefined;
    if (photoUri && !photoUri.startsWith('http')) {
      const url = await uploadPhoto(photoUri);
      photo_url = url ?? undefined;
    } else if (photoUri) {
      photo_url = photoUri;
    }

    await addItem({
      name: name.trim(),
      brand: brand.trim() || undefined,
      category,
      subcategory: subcategory.trim() || undefined,
      size: size.trim() || undefined,
      color: color.trim() || undefined,
      barcode: params.barcode || undefined,
      rating: rating || undefined,
      purchase_year: purchaseYear ? parseInt(purchaseYear) : undefined,
      expiry_date: expiryDate || undefined,
      collection: collection.trim() || undefined,
      link: link.trim() || undefined,
      notes: notes.trim() || undefined,
      occasions: selectedOccs.length ? selectedOccs : undefined,
      photo_url,
      is_wishlist: isWishlist,
    });
    setLoading(false);
    router.back();
  }

  const inputStyle = {
    backgroundColor: theme.paper, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: theme.ink, ...theme.shadow,
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: theme.cream }}>
      {/* Size picker modal */}
      <Modal visible={showSizePicker} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <View style={{ backgroundColor: theme.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: insets.bottom + 24, gap: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 19, fontFamily: 'Newsreader_500Medium', color: theme.ink }}>Choisir une taille</Text>
              <TouchableOpacity onPress={() => setShowSizePicker(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={theme.ink2} />
              </TouchableOpacity>
            </View>

            {/* Letter sizes */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.ink3, letterSpacing: 0.8, textTransform: 'uppercase' }}>Standard</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {LETTER_SIZES.map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => { setSize(s); setShowSizePicker(false); }}
                    activeOpacity={0.75}
                    style={{ paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12, backgroundColor: size === s ? theme.ink : theme.paper, ...theme.shadow }}
                  >
                    <Text style={{ fontWeight: '700', fontSize: 15, color: size === s ? theme.cream : theme.ink }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Numeric sizes */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.ink3, letterSpacing: 0.8, textTransform: 'uppercase' }}>Numérique (34 – 48)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {NUMERIC_SIZES.map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => { setSize(s); setShowSizePicker(false); }}
                    activeOpacity={0.75}
                    style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: size === s ? theme.ink : theme.paper, alignItems: 'center', justifyContent: 'center', ...theme.shadow }}
                  >
                    <Text style={{ fontWeight: '700', fontSize: 13, color: size === s ? theme.cream : theme.ink }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Custom size */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.ink3, letterSpacing: 0.8, textTransform: 'uppercase' }}>Autre / Sur-mesure</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={{ flex: 1, backgroundColor: theme.paper, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: theme.ink, ...theme.shadow }}
                  placeholder="EU 40, US 8, 175cm…"
                  placeholderTextColor={theme.ink3}
                  value={customSize}
                  onChangeText={setCustomSize}
                />
                <TouchableOpacity
                  onPress={() => { if (customSize.trim()) { setSize(customSize.trim()); setCustomSize(''); setShowSizePicker(false); } }}
                  activeOpacity={0.85}
                  style={{ backgroundColor: theme.orange, borderRadius: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top + 8 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.paper, alignItems: 'center', justifyContent: 'center', ...theme.shadow }}>
            <Ionicons name="chevron-down" size={22} color={theme.ink} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontFamily: 'Newsreader_500Medium', color: theme.ink, flex: 1 }}>
            {isWishlist ? 'Ajouter un souhait' : 'Nouvelle pièce'}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 20 }}>
          {/* Photo */}
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.8}
            style={{ height: 200, backgroundColor: theme.paper, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...theme.shadow }}
          >
            {photoUri
              ? null
              : (
                <View style={{ alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.orangeSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="camera-outline" size={28} color={theme.orange} />
                  </View>
                  <Text style={{ fontWeight: '600', fontSize: 14, color: theme.ink2 }}>Ajouter une photo</Text>
                </View>
              )
            }
          </TouchableOpacity>

          <Field label="Catégorie" theme={theme}>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {CATS.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.75}
                  style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: category === cat ? theme.ink : theme.paper, ...((category !== cat) ? theme.shadow : {}) }}
                >
                  <Text style={{ fontWeight: '700', fontSize: 13, color: category === cat ? theme.cream : theme.ink2 }}>
                    {CATEGORY_META[cat].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Nom *" theme={theme}>
            <TextInput style={inputStyle} placeholder="ex: Blazer oversize" placeholderTextColor={theme.ink3} value={name} onChangeText={setName} />
          </Field>

          <Field label="Marque" theme={theme}>
            <TextInput style={inputStyle} placeholder="ex: Zara, Sézane…" placeholderTextColor={theme.ink3} value={brand} onChangeText={setBrand} />
          </Field>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="Taille" theme={theme}>
                <TouchableOpacity
                  onPress={() => setShowSizePicker(true)}
                  activeOpacity={0.75}
                  style={[inputStyle, { justifyContent: 'center' }]}
                >
                  <Text style={{ fontSize: 15, color: size ? theme.ink : theme.ink3 }}>
                    {size || 'Choisir…'}
                  </Text>
                </TouchableOpacity>
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Couleur" theme={theme}>
                <TextInput style={inputStyle} placeholder="Noir, Beige…" placeholderTextColor={theme.ink3} value={color} onChangeText={setColor} />
              </Field>
            </View>
          </View>

          <Field label="Collection / Référence" theme={theme}>
            <TextInput style={inputStyle} placeholder="ex: Printemps 2024" placeholderTextColor={theme.ink3} value={collection} onChangeText={setCollection} />
          </Field>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="Année d'achat" theme={theme}>
                <TextInput style={inputStyle} placeholder="2024" placeholderTextColor={theme.ink3} value={purchaseYear} onChangeText={setPurchaseYear} keyboardType="number-pad" maxLength={4} />
              </Field>
            </View>
            {(category === 'maquillage') && (
              <View style={{ flex: 1 }}>
                <Field label="Expiration" theme={theme}>
                  <TextInput style={inputStyle} placeholder="MM/AAAA" placeholderTextColor={theme.ink3} value={expiryDate} onChangeText={setExpiryDate} />
                </Field>
              </View>
            )}
          </View>

          {/* Rating */}
          <Field label="Note" theme={theme}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRating(n === rating ? 0 : n)} activeOpacity={0.7}>
                  <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={32} color={n <= rating ? theme.orange : theme.ink3} />
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          {/* Occasions */}
          <Field label="Occasions" theme={theme}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {OCCASIONS.map(({ id, label }) => {
                const on = selectedOccs.includes(id);
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => toggleOcc(id)}
                    activeOpacity={0.75}
                    style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, backgroundColor: on ? theme.orange : theme.paper, ...(!on ? theme.shadow : {}) }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: on ? '#fff' : theme.ink2 }}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Field>

          <Field label="Lien (boutique, e-shop…)" theme={theme}>
            <TextInput style={inputStyle} placeholder="https://…" placeholderTextColor={theme.ink3} value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" />
          </Field>

          <Field label="Notes personnelles" theme={theme}>
            <TextInput
              style={[inputStyle, { minHeight: 80, textAlignVertical: 'top', paddingTop: 13 }]}
              placeholder="Ce que tu veux retenir sur cette pièce…"
              placeholderTextColor={theme.ink3}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </Field>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: insets.bottom + 16, backgroundColor: theme.cream, borderTopWidth: 1, borderTopColor: theme.line }}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
          style={{ backgroundColor: theme.ink, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {loading
            ? <ActivityIndicator color={theme.cream} />
            : <>
                <Ionicons name="checkmark" size={20} color={theme.cream} />
                <Text style={{ fontWeight: '700', fontSize: 15, color: theme.cream }}>
                  {isWishlist ? 'Ajouter à la wishlist' : 'Enregistrer la pièce'}
                </Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}
