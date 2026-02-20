import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { usePlants } from '@/features/plants/hooks/usePlants';
import { radius } from '@/design-system/tokens/radius';
import { COLORS } from '@/design-system/tokens/colors';
import { typography } from '@/design-system/tokens/typography';

/**
 * Alerts Card
 * Displays plants with health < 50% that need attention
 * Used in Dashboard
 */
export const AlertsCard: React.FC = () => {
  const router = useRouter();
  const { plants = [] } = usePlants();

  const alertPlants = plants.filter((plant) => plant.sante_score < 50);

  if (alertPlants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>✅ Toutes vos plantes sont en bonne santé !</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AlertCircle size={20} color="#EF4444" />
        <Text style={styles.title}>Alertes</Text>
        <Text style={styles.count}>{alertPlants.length}</Text>
      </View>

      <FlatList
        scrollEnabled={false}
        data={alertPlants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.alertItem}
            onPress={() => router.push(`/plant/${item.id}`)}
          >
            <View style={styles.alertContent}>
              <Text style={styles.plantName}>{item.surnom || item.nom_commun}</Text>
              <View style={styles.healthBar}>
                <View
                  style={[
                    styles.healthFill,
                    {
                      width: `${item.sante_score}%`,
                      backgroundColor:
                        item.sante_score < 30
                          ? '#EF4444'
                          : item.sante_score < 50
                            ? '#F97316'
                            : '#F59E0B',
                    },
                  ]}
                />
              </View>
              <Text style={styles.healthText}>Santé: {item.sante_score}%</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: COLORS.neutral['50'],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  emptyContainer: {
    marginHorizontal: 12,
    marginVertical: 12,
    padding: 16,
    backgroundColor: COLORS.primary['50'],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.label.lg,
    color: COLORS.semantic.success,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...typography.label.lg,
    color: COLORS.text['900'],
    marginLeft: 8,
    flex: 1,
  },
  count: {
    ...typography.body.sm,
    fontWeight: '600',
    backgroundColor: COLORS.error['100'],
    color: COLORS.error['600'],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral['100'],
  },
  alertContent: {
    flex: 1,
  },
  plantName: {
    ...typography.label.lg,
    color: COLORS.text['900'],
    marginBottom: 6,
  },
  healthBar: {
    height: 6,
    backgroundColor: COLORS.neutral['100'],
    borderRadius: radius.xs,
    overflow: 'hidden',
    marginBottom: 4,
  },
  healthFill: {
    height: '100%',
  },
  healthText: {
    ...typography.body.sm,
    color: COLORS.text['500'],
  },
  arrow: {
    fontSize: 16,
    color: COLORS.text['400'],
    marginLeft: 12,
  },
});
