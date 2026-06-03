import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../lib/theme';
import { Item } from '../../lib/types';

// ─── Avatar ─────────────────────────────────────────────────────────────────
interface AvatarProps {
  name?: string;
  initials?: string;
  color?: string;
  size?: number;
  ring?: boolean;
  style?: ViewStyle;
}
export function Avatar({ name, initials, color = '#FC850F', size = 40, ring = false, style }: AvatarProps) {
  const label = initials ?? (name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <View style={[{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, alignItems: 'center', justifyContent: 'center',
      ...(ring ? { borderWidth: 2.5, borderColor: color } : {}),
    }, style]}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.36, letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Stars ───────────────────────────────────────────────────────────────────
export function Stars({ value = 0, size = 14, theme }: { value: number; size?: number; theme: Theme }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Ionicons
          key={n}
          name={n <= value ? 'star' : 'star-outline'}
          size={size}
          color={n <= value ? theme.orange : theme.ink3}
        />
      ))}
    </View>
  );
}

// ─── Tag / Chip ──────────────────────────────────────────────────────────────
type TagVariant = '' | 'pink' | 'orange' | 'ink';
export function Tag({ children, variant = '', theme }: { children: string; variant?: TagVariant; theme: Theme }) {
  const bg = variant === 'pink' ? theme.pinkSoft
    : variant === 'orange' ? theme.orangeSoft
    : variant === 'ink' ? theme.ink
    : theme.surfaceSunken;
  const color = variant === 'pink' ? '#9a3b73'
    : variant === 'orange' ? '#9a5005'
    : variant === 'ink' ? theme.cream
    : theme.ink2;
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 }}>
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{children}</Text>
    </View>
  );
}

// ─── Thumb (placeholder image) ───────────────────────────────────────────────
interface ThumbProps {
  uri?: string | null;
  tint?: 'pink' | 'orange' | null;
  radius?: number;
  style?: ViewStyle;
  tag?: string;
}
export function Thumb({ uri, tint, radius = 0, style, tag }: ThumbProps) {
  const bg = tint === 'pink'
    ? 'rgba(255,166,218,0.3)'
    : tint === 'orange'
    ? 'rgba(252,133,15,0.18)'
    : '#EAE0D4';
  return (
    <View style={[{ backgroundColor: bg, borderRadius: radius, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, style]}>
      {tag && (
        <View style={{ backgroundColor: 'rgba(252,250,246,0.7)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
          <Text style={{ fontSize: 10, color: 'rgba(32,30,31,0.4)', fontWeight: '600', letterSpacing: 0.6 }}>{tag}</Text>
        </View>
      )}
    </View>
  );
}

// ─── RoundBtn ────────────────────────────────────────────────────────────────
interface RoundBtnProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  active?: boolean;
  theme: Theme;
  style?: ViewStyle;
}
export function RoundBtn({ icon, onPress, size = 40, active = false, theme, style }: RoundBtnProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: active ? theme.ink : theme.paper,
        alignItems: 'center', justifyContent: 'center',
        ...theme.shadow,
      }, style]}
    >
      <Ionicons
        name={icon}
        size={size * 0.48}
        color={active ? theme.cream : theme.ink}
      />
    </TouchableOpacity>
  );
}

// ─── ItemCard ────────────────────────────────────────────────────────────────
interface ItemCardProps {
  item: Item;
  onPress?: () => void;
  showFav?: boolean;
  theme: Theme;
}
export function ItemCard({ item, onPress, showFav = true, theme }: ItemCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[{
        backgroundColor: theme.paper,
        borderRadius: 20,
        overflow: 'hidden',
        ...theme.shadow,
      }]}
    >
      <View style={{ aspectRatio: 1 / 1.18, position: 'relative' }}>
        <Thumb
          uri={item.photo_url}
          tint={item.category === 'maquillage' || item.category === 'bijoux' ? 'pink' : 'orange'}
          tag={item.subcategory}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        {showFav && item.rating && item.rating >= 4 && (
          <View style={{
            position: 'absolute', top: 9, right: 9,
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: 'rgba(252,250,246,0.85)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="heart" size={15} color={theme.pink} />
          </View>
        )}
      </View>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: theme.ink3, marginBottom: 3 }}>
          {item.brand}
        </Text>
        <Text numberOfLines={2} style={{ fontWeight: '600', fontSize: 13, lineHeight: 17, color: theme.ink, marginBottom: 7 }}>
          {item.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stars value={item.rating ?? 0} size={11} theme={theme} />
          {item.size && (
            <Text style={{ fontSize: 11, color: theme.ink3, fontWeight: '600' }}>{item.size}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── SectionHead ─────────────────────────────────────────────────────────────
interface SectionHeadProps {
  title: string;
  action?: string;
  onAction?: () => void;
  theme: Theme;
}
export function SectionHead({ title, action, onAction, theme }: SectionHeadProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 26, paddingBottom: 13 }}>
      <Text style={{ fontSize: 19, fontWeight: '500', color: theme.ink, fontFamily: 'Newsreader_500Medium' }}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={{ fontSize: 12.5, fontWeight: '700', color: theme.orange }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Eyebrow ─────────────────────────────────────────────────────────────────
export function Eyebrow({ children, theme, style }: { children: string; theme: Theme; style?: TextStyle }) {
  return (
    <Text style={[{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: theme.ink3 }, style]}>
      {children}
    </Text>
  );
}
