/**
 * Custom Tab Bar Component with Central FAB Scanner
 * - 5 tabs: Accueil, Plantes, Progrès, Profil + FAB Scanner
 * - Lucide React Native icons
 * - Badge notifications with bounce animation
 * - Haptic feedback integration
 * - Safe area handling for notch/home indicator
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Home,
  Leaf,
  Trophy,
  User,
  Camera,
  AlertCircle,
} from 'lucide-react-native';
import { colors as COLORS } from '@/design-system/tokens/colors';

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type TabBarProps = BottomTabBarProps;

interface TabConfig {
  name: string;
  label: string;
  icon: React.ReactNode;
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: TabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Bounce animation for badge
  const [bounceAnims] = React.useState(
    state.routes.map(() => new Animated.Value(0))
  );

  // Tabs configuration with Lucide icons
  const tabConfigs: TabConfig[] = [
    {
      name: 'index',
      label: 'Accueil',
      icon: (
        <Home
          size={24}
          strokeWidth={2}
          color={
            state.index === 0 ? COLORS.primary[600] : COLORS.neutral[400]
          }
        />
      ),
    },
    {
      name: 'garden',
      label: 'Plantes',
      icon: (
        <Leaf
          size={24}
          strokeWidth={2}
          color={
            state.index === 1 ? COLORS.primary[600] : COLORS.neutral[400]
          }
        />
      ),
    },
    {
      name: 'scanner_fab',
      label: 'Scanner',
      icon: (
        <Camera
          size={28}
          strokeWidth={2}
          color={COLORS.neutral[50]}
        />
      ),
    },
    {
      name: 'progress',
      label: 'Progrès',
      icon: (
        <Trophy
          size={24}
          strokeWidth={2}
          color={
            state.index === 2 ? COLORS.primary[600] : COLORS.neutral[400]
          }
        />
      ),
    },
    {
      name: 'profile',
      label: 'Profil',
      icon: (
        <User
          size={24}
          strokeWidth={2}
          color={
            state.index === 3 ? COLORS.primary[600] : COLORS.neutral[400]
          }
        />
      ),
    },
  ];

  // Handle tab press
  const handleTabPress = (routeName: string, isFAB: boolean = false) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeName,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      if (isFAB) {
        // Navigate to scan screen for FAB
        navigation.navigate('scan');
        // Haptic feedback for FAB (Medium impact)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        // Regular tab navigation
        navigation.navigate(routeName);
        // Haptic feedback for tab press (Light impact)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // Bounce animation trigger on badge
  const triggerBounce = (index: number) => {
    Animated.sequence([
      Animated.timing(bounceAnims[index], {
        toValue: -8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnims[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Badge component
  const Badge = ({ index, show }: { index: number; show: boolean }) => {
    if (!show) return null;

    return (
      <Animated.View
        style={[
          styles.badge,
          {
            transform: [{ translateY: bounceAnims[index] }],
          },
        ]}
      >
        <AlertCircle
          size={12}
          color={COLORS.neutral[50]}
          fill={COLORS.error[500]}
          strokeWidth={2}
        />
      </Animated.View>
    );
  };

  // Regular tab button
  const TabButton = ({
    index,
    config,
    isActive,
    onPress,
  }: {
    index: number;
    config: TabConfig;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tabButton,
        isActive && styles.tabButtonActive,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {config.icon}
        <Badge index={index} show={isActive && index === 0} />
      </View>
    </TouchableOpacity>
  );

  // FAB scanner button (centered)
  const FABButton = () => (
    <View style={styles.fabContainer}>
      <TouchableOpacity
        onPress={() => handleTabPress('scan', true)}
        style={styles.fab}
        activeOpacity={0.8}
      >
        {tabConfigs[2].icon}
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.tabBarWrapper}>
        {/* Left side tabs (Accueil, Plantes) */}
        <View style={styles.tabsLeftGroup}>
          <TabButton
            index={0}
            config={tabConfigs[0]}
            isActive={state.index === 0}
            onPress={() => handleTabPress('index')}
          />
          <TabButton
            index={1}
            config={tabConfigs[1]}
            isActive={state.index === 1}
            onPress={() => handleTabPress('garden')}
          />
        </View>

        {/* Central FAB - slightly raised */}
        <FABButton />

        {/* Right side tabs (Progrès, Profil) */}
        <View style={styles.tabsRightGroup}>
          <TabButton
            index={2}
            config={tabConfigs[3]}
            isActive={state.index === 2}
            onPress={() => handleTabPress('progress')}
          />
          <TabButton
            index={3}
            config={tabConfigs[4]}
            isActive={state.index === 3}
            onPress={() => handleTabPress('profile')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.neutral[50],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabBarWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
    position: 'relative',
  },
  tabsLeftGroup: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  tabsRightGroup: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    maxWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary[50],
  },
  iconContainer: {
    position: 'relative',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    marginLeft: -32,
    zIndex: 10,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.semantic.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
