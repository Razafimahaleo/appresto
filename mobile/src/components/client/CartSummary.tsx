import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import Button from '../common/Button';
import type { CartItem } from '../../types';

interface CartSummaryProps {
  items: CartItem[];
  onSendOrder: () => void;
  onUpdateQuantity: (menuId: string, notes: string | undefined, delta: number) => void;
  disabled?: boolean;
}

export default function CartSummary({
  items,
  onSendOrder,
  onUpdateQuantity,
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
            <View style={styles.rowLeft}>
              <TouchableOpacity
                style={[styles.qtyBtn, styles.qtyBtnMinus]}
                onPress={() => onUpdateQuantity(item.menuId, item.notes, -1)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              <TouchableOpacity
                style={[styles.qtyBtn, styles.qtyBtnPlus]}
                onPress={() => onUpdateQuantity(item.menuId, item.notes, 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  qtyBtnMinus: {
    backgroundColor: theme.colors.error,
  },
  qtyBtnPlus: {
    backgroundColor: '#2563eb',
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  itemName: { fontSize: 14, color: theme.colors.text, flex: 1 },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  footer: { marginTop: theme.spacing.md, paddingTop: theme.spacing.sm },
  total: { fontSize: 18, fontWeight: '700', marginBottom: theme.spacing.sm },
});
