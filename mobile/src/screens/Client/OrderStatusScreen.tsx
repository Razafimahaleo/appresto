import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTable } from '../../contexts/TableContext';
import { subscribeToTableOrders } from '../../services/firestore';
import type { Order } from '../../types';
import { theme } from '../../constants/theme';

const statusLabels: Record<Order['status'], string> = {
  pending: 'En attente',
  preparing: 'En préparation',
  ready: 'Prêt',
  delivered: 'Servi',
};

export default function OrderStatusScreen() {
  const { tableId } = useTable();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tableId) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToTableOrders(tableId, (data) => {
      setOrders(data.filter((o) => o.status !== 'delivered'));
      setLoading(false);
    });
    return unsub;
  }, [tableId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const latestOrder = orders[0];

  return (
    <View style={styles.container}>
      {latestOrder ? (
        <>
          <Text style={styles.title}>Statut de votre commande</Text>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>
              {statusLabels[latestOrder.status]}
            </Text>
            <Text style={styles.details}>
              {latestOrder.items.length} plat(s) •{' '}
              {latestOrder.totalPrice.toFixed(2)}€
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.empty}>Aucune commande en cours</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: theme.spacing.lg },
  statusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  details: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 8 },
  empty: { fontSize: 18, color: theme.colors.textSecondary },
});
