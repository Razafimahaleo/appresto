import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { createMenu, updateMenu } from '../../services/firestore';
import { uploadMenuImage } from '../../services/storage';
import Button from '../../components/common/Button';
import type { MenuItem } from '../../types';
import type { CashierStackParamList } from '../../navigation/CashierNavigator';
import { theme } from '../../constants/theme';
import * as ImagePicker from 'expo-image-picker';

const MENUS_PATH = 'restaurants/default/menus';
const RESTAURANT_ID = 'default';

const CATEGORIES = ['Plats', 'Entrées', 'Desserts', 'Boissons', 'Pizzas', 'Burgers', 'Salades', 'Pâtes'];

type RouteProps = RouteProp<CashierStackParamList, 'MenuForm'>;
type NavProp = NativeStackNavigationProp<CashierStackParamList, 'MenuForm'>;

export default function MenuFormScreen() {
  const route = useRoute<RouteProps>();
  const nav = useNavigation<NavProp>();
  const menuId = route.params?.menuId;

  const [loading, setLoading] = useState(!!menuId);
  const [saving, setSaving] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [imageAsset, setImageAsset] = useState<{ uri: string; base64: string; mimeType: string } | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Plats',
    isAvailable: true,
    isPromo: false,
    promoPrice: '',
  });

  useEffect(() => {
    if (menuId) {
      loadMenu();
    }
  }, [menuId]);

  const loadMenu = async () => {
    try {
      const docSnap = await getDoc(doc(db, MENUS_PATH, menuId!));
      if (docSnap.exists()) {
        const data = docSnap.data() as MenuItem;
        setExistingImageUrl(data.image ?? null);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          category: data.category || 'Plats',
          isAvailable: data.isAvailable ?? true,
          isPromo: data.isPromo || false,
          promoPrice: data.promoPrice?.toString() || '',
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le menu');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission requise',
          'Autorisez l’accès à la galerie dans les paramètres pour choisir une image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setImageAsset({
          uri: asset.uri,
          base64: '',
          mimeType: asset.mimeType ?? 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('pickImage error:', error);
      Alert.alert(
        'Erreur',
        "Impossible d'ouvrir la galerie. Vérifiez les permissions ou réessayez."
      );
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Erreur', 'Le prix doit être un nombre positif');
      return;
    }

    setSaving(true);
    try {
      const menuData: Omit<MenuItem, 'id'> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        category: formData.category,
        isAvailable: formData.isAvailable,
        isPromo: formData.isPromo,
        promoPrice: formData.isPromo && formData.promoPrice
          ? parseFloat(formData.promoPrice)
          : undefined,
        image: existingImageUrl ?? undefined,
      };

      if (menuId) {
        // Upload image si modifiée
        let nextImageUrl = existingImageUrl;
        if (imageAsset) {
          nextImageUrl = await uploadMenuImage({
            restaurantId: RESTAURANT_ID,
            menuId,
            imageUri: imageAsset.uri,
            mimeType: imageAsset.mimeType,
          });
        }
        await updateMenu(menuId, { ...menuData, image: nextImageUrl ?? undefined });
        Alert.alert('Succès', 'Menu modifié avec succès', [
          { text: 'OK', onPress: () => nav.goBack() },
        ]);
      } else {
        // 1) créer le menu (sans image), 2) uploader image, 3) update le menu avec l'URL
        const newMenuId = await createMenu(menuData);
        let nextImageUrl: string | null = null;
        if (imageAsset) {
          nextImageUrl = await uploadMenuImage({
            restaurantId: RESTAURANT_ID,
            menuId: newMenuId,
            imageUri: imageAsset.uri,
            mimeType: imageAsset.mimeType,
          });
          await updateMenu(newMenuId, { image: nextImageUrl });
        }
        Alert.alert('Succès', 'Menu créé avec succès', [
          { text: 'OK', onPress: () => nav.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      const isNetworkError = message.includes('Network request failed') || message.includes('Failed to fetch');
      Alert.alert(
        'Erreur',
        isNetworkError
          ? 'Impossible de joindre le serveur. Sur téléphone : ajoute dans mobile/.env la ligne EXPO_PUBLIC_API_URL=http://IP_DE_TON_PC:3000 (ex: http://192.168.1.10:3000), lance le backend sur le PC, puis redémarre Expo.'
          : `Impossible de sauvegarder le menu: ${message}`
      );
    } finally {
      setSaving(false);
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
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Image</Text>
        <View style={styles.imageRow}>
          {(imageAsset || existingImageUrl) ? (
            <Image
              source={{ uri: imageAsset?.uri ?? existingImageUrl ?? undefined }}
              style={styles.imagePreview}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Aucune image</Text>
            </View>
          )}
          <View style={styles.imageButtons}>
            <Button title="Choisir" onPress={pickImage} variant="outline" fullWidth />
            {(imageAsset || existingImageUrl) ? (
              <View style={{ height: theme.spacing.sm }} />
            ) : null}
            {(imageAsset || existingImageUrl) ? (
              <Button
                title="Retirer"
                onPress={() => {
                  setImageAsset(null);
                  setExistingImageUrl(null);
                }}
                variant="secondary"
                fullWidth
              />
            ) : null}
          </View>
        </View>

        <Text style={styles.label}>Nom du plat *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Ex: Pizza Margherita"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Description du plat"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Catégorie</Text>
        <TouchableOpacity
          style={[styles.input, styles.categoryInput]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.categoryText}>{formData.category}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    formData.category === cat && styles.categoryOptionSelected,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, category: cat });
                    setShowCategoryModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      formData.category === cat && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={styles.label}>Prix (€) *</Text>
        <TextInput
          style={styles.input}
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          placeholder="12.50"
          keyboardType="decimal-pad"
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Disponible</Text>
          <Switch
            value={formData.isAvailable}
            onValueChange={(value) => setFormData({ ...formData, isAvailable: value })}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>En promotion</Text>
          <Switch
            value={formData.isPromo}
            onValueChange={(value) => setFormData({ ...formData, isPromo: value })}
          />
        </View>

        {formData.isPromo && (
          <>
            <Text style={styles.label}>Prix promotionnel (Ar)</Text>
            <TextInput
              style={styles.input}
              value={formData.promoPrice}
              onChangeText={(text) => setFormData({ ...formData, promoPrice: text })}
              placeholder="9.90"
              keyboardType="decimal-pad"
            />
          </>
        )}

        <Button
          title={menuId ? 'Modifier' : 'Créer'}
          onPress={handleSave}
          loading={saving}
          fullWidth
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  form: {
    padding: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  imagePreview: {
    width: 120,
    height: 90,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#eee',
  },
  imagePlaceholder: {
    width: 120,
    height: 90,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  imageButtons: {
    flex: 1,
  },
  categoryInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
  },
  categoryText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  categoryOption: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  categoryOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  categoryOptionText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  categoryOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
