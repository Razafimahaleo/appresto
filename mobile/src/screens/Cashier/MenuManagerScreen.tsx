import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { subscribeToMenus, deleteMenu } from '../../services/firestore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import type { MenuItem } from '../../types';
import type { CashierStackParamList } from '../../navigation/CashierNavigator';
import { theme } from '../../constants/theme';

const ALL_CATEGORIES = 'Tout';

type NavProp = NativeStackNavigationProp<CashierStackParamList, 'MenuManager'>;

export default function MenuManagerScreen() {
  const nav = useNavigation<NavProp>();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);

  const categories = useMemo(() => {
    const cats = new Set(menus.map((m) => m.category).filter(Boolean));
    return [ALL_CATEGORIES, ...Array.from(cats).sort()];
  }, [menus]);

  const filteredMenus = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES) return menus;
    return menus.filter((m) => m.category === selectedCategory);
  }, [menus, selectedCategory]);

  useEffect(() => {
    const unsub = subscribeToMenus((data) => {
      setMenus(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDelete = (menu: MenuItem) => {
    Alert.alert(
      'Supprimer le menu',
      `Êtes-vous sûr de vouloir supprimer "${menu.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMenu(menu.id);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le menu');
            }
          },
        },
      ]
    );
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
      <Button
        title="+ Ajouter un menu"
        onPress={() => nav.navigate('MenuForm')}
        fullWidth
        style={styles.addButton}
      />
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
        renderItem={({ item }) => (
          <Card style={styles.menuCard}>
            <View style={styles.menuHeader}>
              <View style={styles.menuInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.menuDetails}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.price}>
                    {item.isPromo && item.promoPrice
                      ? `${item.promoPrice}€ (promo)`
                      : `${item.price}€`}
                  </Text>
                </View>
                {!item.isAvailable && (
                  <Text style={styles.unavailable}>Indisponible</Text>
                )}
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => nav.navigate('MenuForm', { menuId: item.id })}
              >
                <Text style={styles.actionText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item)}
              >
                <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {selectedCategory === ALL_CATEGORIES
              ? 'Aucun menu. Cliquez sur "Ajouter un menu" pour commencer.'
              : 'Aucun menu dans cette catégorie.'}
          </Text>
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
  addButton: {
    marginBottom: theme.spacing.md,
  },
  categoryBar: {
    marginBottom: theme.spacing.sm,
  },
  categoryBarContent: {
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  categoryChip: {
    marginRight: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: '#0ea5e9',
    borderWidth: 1,
    borderColor: '#0ea5e9',
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
  menuCard: {
    marginBottom: theme.spacing.sm,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  menuDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  category: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  unavailable: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: theme.colors.secondary,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deleteText: {
    color: theme.colors.error,
  },
  empty: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
