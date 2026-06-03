import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Item, Category } from '../lib/types';
import { useAuth } from '../context/AuthContext';

export function useWardrobe(category?: Category) {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let q = supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_wishlist', false)
      .order('created_at', { ascending: false });
    if (category) q = q.eq('category', category);
    const { data } = await q;
    setItems(data ?? []);
    setLoading(false);
  }, [user, category]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addItem(item: Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (!user) return null;
    const { data, error } = await supabase
      .from('items')
      .insert({ ...item, user_id: user.id })
      .select()
      .single();
    if (!error && data) { setItems(prev => [data, ...prev]); }
    return error ? null : data;
  }

  async function updateItem(id: string, patch: Partial<Item>) {
    const { data, error } = await supabase
      .from('items')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      setItems(prev => prev.map(i => i.id === id ? data : i));
    }
    return error ? null : data;
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) setItems(prev => prev.filter(i => i.id !== id));
    return !error;
  }

  return { items, loading, addItem, updateItem, deleteItem, refresh: fetch };
}

export function useWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_wishlist', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, [user]);

  return { items, loading };
}

export function useCategoryCounts() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<Category, number>>({
    vetements: 0, chaussures: 0, maquillage: 0, bijoux: 0,
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from('items')
      .select('category')
      .eq('user_id', user.id)
      .eq('is_wishlist', false)
      .then(({ data }) => {
        const c = { vetements: 0, chaussures: 0, maquillage: 0, bijoux: 0 } as Record<Category, number>;
        data?.forEach(({ category }) => { if (c[category as Category] !== undefined) c[category as Category]++; });
        setCounts(c);
      });
  }, [user]);

  return counts;
}

export function useOutfits() {
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('outfits')
      .select('*, outfit_items(item_id, items(*))')
      .eq('user_id', user.id)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(10)
      .then(({ data }) => setOutfits(data ?? []));
  }, [user]);

  async function saveOutfit(name: string, itemIds: string[], date?: string) {
    if (!user) return null;
    const { data: outfit } = await supabase
      .from('outfits')
      .insert({ name, user_id: user.id, date })
      .select()
      .single();
    if (!outfit) return null;
    await supabase.from('outfit_items').insert(
      itemIds.map(item_id => ({ outfit_id: outfit.id, item_id }))
    );
    return outfit;
  }

  return { outfits, saveOutfit };
}

export function useFeed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    // Récupère les activités des amis
    supabase
      .from('feed_activities')
      .select('*, profile:profiles(*), item:items(*)')
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setFeed(data ?? []));
  }, [user]);

  return feed;
}
