import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { updateOrderStatus } from '../../services/firestore';
import Button from '../../components/common/Button';
import type { Order } from '../../types';
import type { ChefStackParamList } from '../../navigation/ChefNavigator';
import { theme } from '../../constants/theme';

type RouteProps = RouteProp<ChefStackParamList, 'OrderDetail'>;
const ORDERS_PATH = 'restaurants/default/orders';

export default function OrderDetailScreen() {
  const { params } = useRoute<RouteProps>();
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, ORDERS_PATH, params.orderId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setOrder({
            id: snap.id,
            ...data,
            createdAt: data?.createdAt?.toDate?.() ?? data?.createdAt,
            updatedAt: data?.updatedAt?.toDate?.() ?? data?.updatedAt,
          } as Order);
        }
      }
    );
    return unsub;
  }, [params.orderId]);

  const handleStatus = async (status: Order['status']) => {
    setUpdating(true);
    try {
      await updateOrderStatus(params.orderId, status);
    } finally {
      setUpdating(false);
    }
  };

  if (!order) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const canPrepare = order.status === 'pending';
  const canReady = order.status === 'preparing';

  return (
    <View style={styles.container}>
      <Text style={styles.table}>Table {order.tableName}</Text>
      <View style={styles.items}>
        {order.items.map((item, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.itemName}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.itemPrice}>
              {(item.price * item.quantity).toFixed(2)}€
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.total}>Total: {order.totalPrice.toFixed(2)}€</Text>
      <View style={styles.actions}>
        {canPrepare && (
          <Button
            title="En préparation"
            onPress={() => handleStatus('preparing')}
            loading={updating}
          />
        )}
        {canReady && (
          <Button
            title="Prêt"
            onPress={() => handleStatus('ready')}
            loading={updating}
          />
        )}
        {order.status === 'ready' && (
          <Text style={styles.readyText}>Commande prête - Envoyée à la caissière</Text>
        )}
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
  table: { fontSize: 24, fontWeight: '700', marginBottom: theme.spacing.lg },
  items: { marginBottom: theme.spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemName: { fontSize: 16 },
  itemPrice: { fontSize: 16, fontWeight: '600' },
  total: { fontSize: 20, fontWeight: '700', marginBottom: theme.spacing.xl },
  actions: { gap: theme.spacing.md },
  readyText: { fontSize: 18, color: theme.colors.success, fontWeight: '600' },
});
