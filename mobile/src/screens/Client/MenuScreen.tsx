import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTable } from '../../contexts/TableContext';
import { subscribeToMenus, createOrder } from '../../services/firestore';
import MenuItem from '../../components/client/MenuItem';
import CartSummary from '../../components/client/CartSummary';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MenuItem as MenuItemType } from '../../types';
import type { CartItem } from '../../types';
import type { ClientStackParamList } from '../../navigation/ClientNavigator';
import { theme } from '../../constants/theme';

type NavProp = NativeStackNavigationProp<ClientStackParamList, 'Menu'>;

export default function MenuScreen() {
  const { tableId, tableName } = useTable();
  const nav = useNavigation<NavProp>();
  const [menus, setMenus] = useState<MenuItemType[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsub = subscribeToMenus(setMenus);
    setLoading(false);
    return unsub;
  }, []);

  const addToCart = (item: MenuItemType) => {
    const price = item.isPromo && item.promoPrice ? item.promoPrice : item.price;
    setCart((prev) => {
      const existing = prev.find((i) => i.menuId === item.id && !i.notes);
      if (existing) {
        return prev.map((i) =>
          i.menuId === item.id && !i.notes
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { menuId: item.id, name: item.name, quantity: 1, price }];
    });
  };

  const handleSendOrder = async () => {
    if (!tableId || !tableName || cart.length === 0) return;
    setSending(true);
    try {
      const items = cart.map(({ menuId, name, quantity, price }) => ({
        menuId,
        name,
        quantity,
        price,
      }));
      await createOrder(tableId, tableName, items);
      setCart([]);
      nav.navigate('OrderStatus');
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
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
      <View style={styles.menuSection}>
        <FlatList
          data={menus.filter((m) => m.isAvailable)}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.menuItem}>
              <MenuItem item={item} onAdd={() => addToCart(item)} />
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      </View>
      <View style={styles.cartSection}>
        <CartSummary
          items={cart}
          onSendOrder={handleSendOrder}
          disabled={sending || !tableId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  menuSection: { flex: 1, padding: theme.spacing.md },
  list: { paddingBottom: theme.spacing.xl },
  menuItem: { flex: 1, maxWidth: '50%', padding: theme.spacing.xs },
  cartSection: { width: 320, padding: theme.spacing.md },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
