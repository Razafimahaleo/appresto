import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { subscribeToOrders, updateOrderStatus } from '../../services/firestore';
import Button from '../../components/common/Button';
import type { Order } from '../../types';
import { theme } from '../../constants/theme';

export default function ReadyOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToOrders((data) => {
      setOrders(data.filter((o) => o.status === 'ready'));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDelivered = async (order: Order) => {
    setUpdating(order.id);
    try {
      await updateOrderStatus(order.id, 'delivered');
    } catch (err) {
      console.error('Servi failed:', err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plats prêts à servir</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.table}>Table {item.tableName}</Text>
              <Text style={styles.items}>
                {item.items.reduce((s, i) => s + i.quantity, 0)} plat(s)
              </Text>
            </View>
            <Button
              title="Servi"
              onPress={() => handleDelivered(item)}
              loading={updating === item.id}
              variant="secondary"
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun plat prêt</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: theme.spacing.lg },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  cardContent: { flex: 1 },
  table: { fontSize: 18, fontWeight: '600' },
  items: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  empty: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center' },
});
