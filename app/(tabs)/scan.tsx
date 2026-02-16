import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@design-system/components/Card';

export default function ScanScreen() {
  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Scanner une plante</Text>
        <Text style={styles.subtitle}>
          Cette fonctionnalité sera implémentée en Phase 2
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F0',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
});
