import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const TABS = [
  { name: 'index',    label: 'Accueil',  icon: 'home-outline',    iconActive: 'home'          },
  { name: 'wardrobe', label: 'Dressing', icon: 'shirt-outline',   iconActive: 'shirt'         },
  { name: 'scan',     label: 'Scanner',  icon: 'scan-outline',    iconActive: 'scan'          },
  { name: 'profile',  label: 'Profil',   icon: 'person-outline',  iconActive: 'person'        },
] as const;

function TabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingBottom: insets.bottom + 8, pointerEvents: 'box-none' }}>
      <View style={[{
        flexDirection: 'row',
        backgroundColor: theme.navBg,
        borderRadius: 26,
        paddingVertical: 11,
        paddingHorizontal: 8,
        ...theme.shadow,
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 12,
      }]}>
        {state.routes.map((route: any, i: number) => {
          const tab = TABS[i];
          const focused = state.index === i;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 2 }}
            >
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={23}
                color={focused ? theme.orange : theme.ink2}
              />
              <Text style={{
                fontSize: 10.5,
                fontWeight: focused ? '700' : '600',
                color: focused ? theme.orange : theme.ink2,
                letterSpacing: 0.1,
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="wardrobe" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
