import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import type { Order } from '../../types';

const statusLabels: Record<Order['status'], string> = {
  pending: 'En attente',
  preparing: 'En préparation',
  ready: 'Prêt',
  delivered: 'Servi',
};

const statusColors: Record<Order['status'], string> = {
  pending: theme.colors.warning,
  preparing: theme.colors.secondary,
  ready: theme.colors.success,
  delivered: theme.colors.textSecondary,
};

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.table}>Table {order.tableName}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: statusColors[order.status] },
          ]}
        >
          <Text style={styles.badgeText}>{statusLabels[order.status]}</Text>
        </View>
      </View>
      <Text style={styles.items}>{totalItems} article(s)</Text>
      <Text style={styles.total}>{order.totalPrice.toFixed(2)}€</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.sm,
    minWidth: 160,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  table: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  items: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  total: { fontSize: 14, fontWeight: '600', marginTop: 4 },
});
