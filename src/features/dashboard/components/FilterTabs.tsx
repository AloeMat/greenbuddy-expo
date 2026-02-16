/**
 * Filter Tabs Component
 * Horizontal scrollable tabs for filtering plant lists
 * Reusable across garden, dashboard, and other list screens
 */

import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle
} from 'react-native';

export type FilterOption = 'all' | 'health' | 'urgent' | 'personality';

export interface FilterTab {
  id: FilterOption;
  label: string;
  icon: string;
  description?: string;
}

export interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: FilterOption;
  onTabSelect: (tab: FilterOption) => void;
  style?: ViewStyle;
}

const DEFAULT_TABS: FilterTab[] = [
  {
    id: 'all',
    label: 'Tous',
    icon: '🌿',
    description: 'Toutes les plantes'
  },
  {
    id: 'urgent',
    label: 'Urgent',
    icon: '⚠️',
    description: 'Arrosage urgent'
  },
  {
    id: 'health',
    label: 'Santé',
    icon: '🏥',
    description: 'Plantes malades'
  },
  {
    id: 'personality',
    label: 'Personnalité',
    icon: '🎭',
    description: 'Par type'
  }
];

export const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabSelect,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive
            ]}
            onPress={() => onTabSelect(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <View style={styles.tabTextContainer}>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive
              ]}>
                {tab.label}
              </Text>
              {tab.description && (
                <Text style={[
                  styles.tabDescription,
                  activeTab === tab.id && styles.tabDescriptionActive
                ]}>
                  {tab.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  scroll: {
    flex: 0
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8
  },
  tabActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981'
  },
  tabIcon: {
    fontSize: 16
  },
  tabTextContainer: {
    justifyContent: 'center'
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666'
  },
  tabLabelActive: {
    color: '#10B981'
  },
  tabDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 2
  },
  tabDescriptionActive: {
    color: '#10B981'
  }
});
