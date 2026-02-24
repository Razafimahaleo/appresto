import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
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
      // On garde uniquement les commandes non livrées
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

  if (!orders.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Aucune commande en cours</Text>
      </View>
    );
  }

  // Firestore renvoie les commandes les plus récentes en premier,
  // on inverse pour avoir la première commande en haut, la suivante en dessous.
  const orderedOrders = [...orders].reverse();
  const totalAll = orderedOrders.reduce(
    (sum, o) => sum + (o.totalPrice || 0),
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes commandes en cours</Text>

      <FlatList
        data={orderedOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderTitle}>Commande #{index + 1}</Text>
              <Text style={styles.statusBadge}>
                {statusLabels[item.status]}
              </Text>
            </View>
            <Text style={styles.orderDetails}>
              {item.items.length} plat(s) • {item.totalPrice.toFixed(2)}€
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total de toutes les commandes</Text>
        <Text style={styles.totalValue}>{totalAll.toFixed(2)}€</Text>
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  orderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  orderDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  separator: {
    height: theme.spacing.sm,
  },
  totalContainer: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  empty: { fontSize: 18, color: theme.colors.textSecondary },
});
