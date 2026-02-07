import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { theme } from '../../constants/theme';
import Button from '../common/Button';
import type { CartItem } from '../../types';

interface CartSummaryProps {
  items: CartItem[];
  onSendOrder: () => void;
  disabled?: boolean;
}

export default function CartSummary({
  items,
  onSendOrder,
  disabled,
}: CartSummaryProps) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panier ({totalItems})</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.menuId}-${item.notes || ''}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.itemName}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.itemPrice}>
              {(item.price * item.quantity).toFixed(2)}€
            </Text>
          </View>
        )}
        style={styles.list}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: {total.toFixed(2)}€</Text>
        <Button
          title="Envoyer la commande"
          onPress={onSendOrder}
          disabled={disabled || items.length === 0}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flex: 1,
    minWidth: 280,
  },
  title: { fontSize: 18, fontWeight: '600', marginBottom: theme.spacing.sm },
  list: { flex: 1, maxHeight: 300 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: { fontSize: 14, color: theme.colors.text },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  footer: { marginTop: theme.spacing.md, paddingTop: theme.spacing.sm },
  total: { fontSize: 18, fontWeight: '700', marginBottom: theme.spacing.sm },
});
