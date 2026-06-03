import { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { lookupBarcode } from '../../lib/apis';
import { BarcodeProduct } from '../../lib/types';

export default function ScanScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BarcodeProduct | null>(null);
  const [notFound, setNotFound] = useState(false);
  const lastScan = useRef<string>('');
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Animate scanline
  useState(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  });

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });

  const handleBarcode = useCallback(async ({ data, type }: BarcodeScanningResult) => {
    if (!scanning || data === lastScan.current) return;
    lastScan.current = data;
    setScanning(false);
    setLoading(true);
    setNotFound(false);

    const product = await lookupBarcode(data);
    setLoading(false);
    if (product) {
      setResult(product);
    } else {
      setNotFound(true);
      lastScan.current = '';
      setScanning(true);
    }
  }, [scanning]);

  function addToWardrobe() {
    if (!result) return;
    router.push({
      pathname: '/item/add',
      params: {
        name: result.name,
        brand: result.brand ?? '',
        barcode: result.barcode,
        image: result.images?.[0] ?? '',
      },
    });
  }

  function reset() {
    setResult(null);
    setNotFound(false);
    setScanning(true);
    lastScan.current = '';
  }

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: theme.cream }} />;
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.cream, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Ionicons name="camera-outline" size={56} color={theme.orange} />
        <Text style={{ fontSize: 22, fontFamily: 'Newsreader_500Medium', color: theme.ink, textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
          Accès à la caméra
        </Text>
        <Text style={{ fontSize: 14, color: theme.ink2, textAlign: 'center', marginBottom: 28 }}>
          Outfy a besoin de la caméra pour scanner les codes-barres de tes articles.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{ backgroundColor: theme.orange, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanning ? handleBarcode : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
        }}
      />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontFamily: 'Newsreader_500Medium', color: '#fff' }}>Scanner</Text>
        <TouchableOpacity
          onPress={() => router.push('/item/add')}
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}
          activeOpacity={0.75}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Saisir manuellement</Text>
        </TouchableOpacity>
      </View>

      {/* Viewfinder */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 270, height: 270, position: 'relative' }}>
          {/* Corners */}
          {[
            { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
            { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
            { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
            { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
          ].map((corner, i) => (
            <View key={i} style={{ position: 'absolute', width: 28, height: 28, borderColor: theme.orange, borderRadius: 3, ...corner as any }} />
          ))}

          {/* Scanline */}
          {scanning && !loading && (
            <Animated.View style={{
              position: 'absolute', left: 8, right: 8, height: 2.5,
              backgroundColor: theme.orange,
              shadowColor: theme.orange, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 8,
              top: '50%',
              transform: [{ translateY: scanLineTranslate }],
            }} />
          )}

          {loading && (
            <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={theme.orange} />
            </View>
          )}
        </View>

        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 24, textAlign: 'center' }}>
          {loading ? 'Recherche du produit…' : 'Pointe la caméra vers le code-barre'}
        </Text>

        {notFound && (
          <View style={{ marginTop: 12, backgroundColor: 'rgba(252,133,15,0.2)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ color: theme.orange, fontWeight: '600', fontSize: 13 }}>
              Produit introuvable — essaie la saisie manuelle
            </Text>
          </View>
        )}
      </View>

      {/* Result card */}
      {result && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: insets.bottom + 24, ...theme.shadow }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
            <View style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: theme.orangeSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="bag-outline" size={28} color={theme.orange} />
            </View>
            <View style={{ flex: 1 }}>
              {result.brand && (
                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: theme.ink3, marginBottom: 3 }}>
                  {result.brand}
                </Text>
              )}
              <Text style={{ fontWeight: '700', fontSize: 16, color: theme.ink, lineHeight: 21 }}>
                {result.name}
              </Text>
              {result.category && (
                <Text style={{ fontSize: 12, color: theme.ink2, marginTop: 3 }}>{result.category}</Text>
              )}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={reset}
              activeOpacity={0.75}
              style={{ flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: theme.surfaceSunken }}
            >
              <Text style={{ fontWeight: '700', fontSize: 14, color: theme.ink2 }}>Rescanner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addToWardrobe}
              activeOpacity={0.85}
              style={{ flex: 2, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: theme.orange, shadowColor: theme.orange, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 }}
            >
              <Text style={{ fontWeight: '700', fontSize: 14, color: '#fff' }}>Ajouter au dressing</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
