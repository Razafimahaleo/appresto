import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { theme } from '../../constants/theme';
import type { MenuItem as MenuItemType } from '../../types';

interface MenuItemProps {
  item: MenuItemType;
  onAdd: () => void;
  disabled?: boolean;
}

export default function MenuItem({ item, onAdd, disabled }: MenuItemProps) {
  const price = item.isPromo && item.promoPrice ? item.promoPrice : item.price;

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : null}
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        {item.category ? (
          <Text style={styles.category}>{item.category}</Text>
        ) : null}
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.row}>
          <Text style={styles.price}>
            {item.isPromo ? (
              <>
                <Text style={styles.oldPrice}>{item.price}€</Text> {price}€
              </>
            ) : (
              `${price}€`
            )}
          </Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAdd}
            disabled={disabled || !item.isAvailable}
          >
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  disabled: { opacity: 0.6 },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  category: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  price: { fontSize: 16, fontWeight: '600', color: theme.colors.primary },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
