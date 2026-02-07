import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { subscribeToMenus } from '../../services/firestore';
import Card from '../../components/common/Card';
import type { MenuItem } from '../../types';
import { theme } from '../../constants/theme';

export default function MenuManagerScreen() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToMenus((data) => {
      setMenus(data);
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
      <Text style={styles.hint}>
        Gestion CRUD à connecter (Firestore Admin ou API backend)
      </Text>
      <FlatList
        data={menus}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>
              {item.isPromo ? `${item.promoPrice}€ (promo)` : `${item.price}€`}
            </Text>
            <Text style={styles.category}>{item.category}</Text>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun menu</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  hint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  name: { fontSize: 18, fontWeight: '600' },
  price: { fontSize: 16, color: theme.colors.primary, marginTop: 4 },
  category: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  empty: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center' },
});
