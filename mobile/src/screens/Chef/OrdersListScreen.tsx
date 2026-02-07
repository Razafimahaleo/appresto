import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { subscribeToOrders } from '../../services/firestore';
import OrderCard from '../../components/chef/OrderCard';
import type { Order } from '../../types';
import type { ChefStackParamList } from '../../navigation/ChefNavigator';
import { theme } from '../../constants/theme';

type NavProp = NativeStackNavigationProp<ChefStackParamList, 'OrdersList'>;

export default function OrdersListScreen() {
  const nav = useNavigation<NavProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToOrders((data) => {
      setOrders(data.filter((o) => o.status !== 'delivered'));
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => nav.navigate('OrderDetail', { orderId: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune commande</Text>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  list: { paddingBottom: theme.spacing.xl },
  empty: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
