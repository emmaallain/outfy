export type Category = 'vetements' | 'chaussures' | 'maquillage' | 'bijoux';
export type Occasion = 'soiree' | 'casual' | 'sport' | 'ete' | 'hiver' | 'travail' | 'ceremonie';

export interface Item {
  id: string;
  user_id: string;
  name: string;
  brand?: string;
  category: Category;
  subcategory?: string;
  size?: string;
  color?: string;
  barcode?: string;
  rating?: number;
  purchase_year?: number;
  expiry_date?: string;
  collection?: string;
  link?: string;
  notes?: string;
  occasions?: Occasion[];
  photo_url?: string;
  is_wishlist?: boolean;
  wishlist_price?: string;
  created_at: string;
  updated_at: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  date?: string;
  occasion?: string;
  notes?: string;
  item_ids?: string[];
  items?: Item[];
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  avatar_color?: string;
  created_at: string;
}

export interface FeedActivity {
  id: string;
  user_id: string;
  action: string;
  item_id?: string;
  outfit_id?: string;
  created_at: string;
  profile?: Profile;
  item?: Item;
  outfit?: Outfit;
}

export interface BarcodeProduct {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  images?: string[];
}

export const CATEGORY_META: Record<Category, { label: string; icon: string; tint: 'orange' | 'pink' }> = {
  vetements:  { label: 'Vêtements',  icon: 'shirt',    tint: 'orange' },
  chaussures: { label: 'Chaussures', icon: 'shoe',     tint: 'orange' },
  maquillage: { label: 'Maquillage', icon: 'lipstick', tint: 'pink'   },
  bijoux:     { label: 'Bijoux',     icon: 'gem',      tint: 'pink'   },
};

export const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: 'casual',    label: 'Casual'    },
  { id: 'soiree',    label: 'Soirée'    },
  { id: 'sport',     label: 'Sport'     },
  { id: 'ete',       label: 'Été'       },
  { id: 'hiver',     label: 'Hiver'     },
  { id: 'travail',   label: 'Travail'   },
  { id: 'ceremonie', label: 'Cérémonie' },
];
