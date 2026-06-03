# Outfy — Application React Native

Garde-robe intelligente : composer ses tenues dans son lit, scanner ses pièces, partager avec ses amies.

## Stack

- **React Native** + **Expo SDK 52** + **Expo Router v4** (navigation fichier-based)
- **Supabase** — auth, base de données, stockage photos
- **UPCitemDB** + **Open Beauty Facts** — lookup produit via code-barre
- **expo-sensors** `LightSensor` — thème adaptatif (crème le jour / nuit en basse luminosité)
- **expo-camera** — scan de codes-barres intégré

## Installation

```bash
cd outfy-app
npm install
# Copier .env.example → .env.local et renseigner les clés Supabase
cp .env.example .env.local
npx expo start
```

## Variables d'environnement (`.env.local`)

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
EXPO_PUBLIC_UPCITEMDB_KEY=trial   # ou ta clé si compte UPCitemDB
```

## Setup Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. SQL Editor → coller `supabase/migrations/001_schema.sql` → Run
3. Storage → créer un bucket `item-photos` (public, 5 MB max)
4. Authentication → Email confirmations : désactiver pour dev

## Thème adaptatif

| Condition | Thème |
|---|---|
| Android avec capteur lumière < 40 lux | **Nuit** (fond sombre) |
| iOS dark mode système | **Nuit** |
| Heure < 7h ou > 20h (fallback) | **Nuit** |
| Sinon | **Crème** (fond clair) |

## APIs produits

| API | Usage | Limite gratuite |
|---|---|---|
| Open Beauty Facts | Maquillage, parfums, cosmétiques | Illimitée |
| UPCitemDB (trial) | Vêtements, chaussures, accessoires | 100 req/jour |
| Open Food Facts | Fallback généraliste | Illimitée |

## Structure

```
app/
  _layout.tsx          # Root : providers + navigation guard
  (auth)/              # Login / Signup
  (tabs)/              # Onglets : Accueil, Dressing, Scanner, Profil
  item/[id].tsx        # Fiche article
  item/add.tsx         # Ajouter / modifier une pièce
  outfit/create.tsx    # Composer une tenue
  friend/[id].tsx      # Garde-robe d'une amie
context/               # ThemeContext (adaptatif) + AuthContext
hooks/                 # useWardrobe, useOutfits, useFeed…
lib/                   # supabase.ts, apis.ts, theme.ts, types.ts
supabase/migrations/   # Schéma SQL complet
```
