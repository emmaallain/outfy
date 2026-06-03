import { BarcodeProduct } from './types';

// Open Beauty Facts — gratuit, sans clé, idéal pour maquillage/cosmétiques
async function lookupOpenBeautyFacts(barcode: string): Promise<BarcodeProduct | null> {
  try {
    const res = await fetch(
      `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`,
      { headers: { 'User-Agent': 'Outfy/1.0 (fr.outfy.app)' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    const name = p.product_name_fr || p.product_name || '';
    if (!name) return null;
    return {
      barcode,
      name,
      brand: p.brands?.split(',')[0]?.trim(),
      category: p.categories_tags?.[0]?.replace('en:', ''),
      description: p.generic_name_fr || p.generic_name,
      images: p.image_front_url ? [p.image_front_url] : [],
    };
  } catch {
    return null;
  }
}

// UPCitemDB — gratuit 100 req/jour (trial), meilleur pour vêtements & chaussures
async function lookupUPCitemDB(barcode: string): Promise<BarcodeProduct | null> {
  try {
    const key = process.env.EXPO_PUBLIC_UPCITEMDB_KEY ?? 'trial';
    const url = key === 'trial'
      ? `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
      : `https://api.upcitemdb.com/prod/v1/lookup?upc=${barcode}`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(key !== 'trial' ? { 'user_key': key } : {}),
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.items?.[0];
    if (!item?.title) return null;
    return {
      barcode,
      name: item.title,
      brand: item.brand,
      category: item.category,
      description: item.description,
      images: item.images ?? [],
    };
  } catch {
    return null;
  }
}

// Open Food Facts — fallback généraliste
async function lookupOpenFoodFacts(barcode: string): Promise<BarcodeProduct | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { headers: { 'User-Agent': 'Outfy/1.0 (fr.outfy.app)' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    const name = p.product_name_fr || p.product_name || '';
    if (!name) return null;
    return { barcode, name, brand: p.brands?.split(',')[0]?.trim() };
  } catch {
    return null;
  }
}

export async function lookupBarcode(barcode: string): Promise<BarcodeProduct | null> {
  // Beauté d'abord (maquillage, parfum, bijoux)
  const beauty = await lookupOpenBeautyFacts(barcode);
  if (beauty) return beauty;
  // Vêtements, chaussures et général
  const upc = await lookupUPCitemDB(barcode);
  if (upc) return upc;
  // Dernier recours
  return lookupOpenFoodFacts(barcode);
}
