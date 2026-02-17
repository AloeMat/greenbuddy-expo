import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Leaf, TrendingUp, User, Camera } from 'lucide-react-native';

interface Tab {
  name: string;
  label: string;
  Icon: React.FC<{ size: number; color: string }>;
  route: string;
}

const TABS: Tab[] = [
  {
    name: 'dashboard',
    label: 'Accueil',
    Icon: Home,
    route: '/(tabs)'
  },
  {
    name: 'garden',
    label: 'Jardin',
    Icon: Leaf,
    route: '/(tabs)/garden'
  },
  {
    name: 'progress',
    label: 'Progression',
    Icon: TrendingUp,
    route: '/(tabs)/progress'
  },
  {
    name: 'scan',
    label: 'Scanner',
    Icon: Camera,
    route: '/(tabs)/scan'
  },
  {
    name: 'profile',
    label: 'Profil',
    Icon: User,
    route: '/(tabs)/profile'
  }
];

export const BottomTabsBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string): boolean => {
    if (route === '/(tabs)' && pathname === '/') return true;
    return pathname === route || pathname.startsWith(route + '/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const active = isActive(tab.route);
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => router.push(tab.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, active && styles.iconActive]}>
                <tab.Icon size={24} color={active ? '#2D5A27' : '#666'} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    paddingBottom: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
  },
  tab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(45, 90, 39, 0.05)',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  iconActive: {
    backgroundColor: 'rgba(45, 90, 39, 0.1)',
  },
});
