import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTable } from '../../contexts/TableContext';
import { subscribeToMenus, subscribeToTableOrders, createOrder } from '../../services/firestore';
import MenuItem from '../../components/client/MenuItem';
import CartSummary from '../../components/client/CartSummary';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MenuItem as MenuItemType } from '../../types';
import type { CartItem } from '../../types';
import type { ClientStackParamList } from '../../navigation/ClientNavigator';
import { theme } from '../../constants/theme';

const ALL_CATEGORIES = 'Tout';

type NavProp = NativeStackNavigationProp<ClientStackParamList, 'Menu'>;

export default function MenuScreen() {
  const { tableId, tableName } = useTable();
  const nav = useNavigation<NavProp>();
  const [menus, setMenus] = useState<MenuItemType[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);
  const [tableOrders, setTableOrders] = useState<{ status: string }[]>([]);

  const hasOrderInProgress = useMemo(
    () => tableOrders.some((o) => o.status !== 'delivered'),
    [tableOrders]
  );

  const categories = useMemo(() => {
    const cats = new Set(menus.map((m) => m.category).filter(Boolean));
    return [ALL_CATEGORIES, ...Array.from(cats).sort()];
  }, [menus]);

  const filteredMenus = useMemo(() => {
    const available = menus.filter((m) => m.isAvailable);
    if (selectedCategory === ALL_CATEGORIES) return available;
    return available.filter((m) => m.category === selectedCategory);
  }, [menus, selectedCategory]);

  useEffect(() => {
    const unsub = subscribeToMenus(setMenus);
    setLoading(false);
    return unsub;
  }, []);

  useEffect(() => {
    if (!tableId) {
      setTableOrders([]);
      return;
    }
    return subscribeToTableOrders(tableId, (orders) => {
      setTableOrders(orders.map((o) => ({ status: o.status })));
    });
  }, [tableId]);

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

  const updateCartQuantity = (
    menuId: string,
    notes: string | undefined,
    delta: number
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.menuId === menuId && (i.notes || '') === (notes || '')
      );
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter(
          (i) => !(i.menuId === menuId && (i.notes || '') === (notes || ''))
        );
      }
      return prev.map((i) =>
        i.menuId === menuId && (i.notes || '') === (notes || '')
          ? { ...i, quantity: newQty }
          : i
      );
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
        {hasOrderInProgress && (
          <TouchableOpacity
            style={styles.orderStatusBtn}
            onPress={() => nav.navigate('OrderStatus')}
          >
            <Text style={styles.orderStatusBtnText}>Commande en cours</Text>
          </TouchableOpacity>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryBar}
          contentContainerStyle={styles.categoryBarContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <FlatList
          data={filteredMenus}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.menuItem}>
              <MenuItem item={item} onAdd={() => addToCart(item)} />
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyCategory}>
              Aucun plat dans cette catégorie
            </Text>
          }
        />
      </View>
      <View style={styles.cartSection}>
        <CartSummary
          items={cart}
          onSendOrder={handleSendOrder}
          onUpdateQuantity={updateCartQuantity}
          disabled={sending || !tableId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  menuSection: { flex: 1, padding: theme.spacing.md },
  orderStatusBtn: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  orderStatusBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  categoryBar: { marginBottom: theme.spacing.sm },
  categoryBarContent: {
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  categoryChip: {
    marginRight: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  list: { paddingBottom: theme.spacing.xl },
  menuItem: { flex: 1, maxWidth: '50%', padding: theme.spacing.xs },
  cartSection: { width: 320, padding: theme.spacing.md },
  emptyCategory: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
