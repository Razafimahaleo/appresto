import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  subscribeToTablesList,
  addTable,
  removeTable,
  setTablesList,
  type TableItem,
} from '../../services/firestore';
import { theme } from '../../constants/theme';
import Button from '../../components/common/Button';

const DEFAULT_TABLES: TableItem[] = [
  { id: '1', name: '1' },
  { id: '2', name: '2' },
  { id: '3', name: '3' },
  { id: '4', name: '4' },
  { id: '5', name: '5' },
];

export default function TablesManagerScreen() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return subscribeToTablesList((list) => {
      setTables(list);
      setLoading(false);
    });
  }, []);

  const handleAddTable = async () => {
    const name = newTableName.trim() || undefined;
    if (!name) return;
    setSaving(true);
    try {
      await addTable(name);
      setNewTableName('');
      setAddModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d\'ajouter la table');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTable = (table: TableItem) => {
    Alert.alert(
      'Supprimer la table',
      `Supprimer la table "${table.name}" ? Les commandes existantes gardent cette table en historique.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTable(table.id);
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de supprimer la table');
            }
          },
        },
      ]
    );
  };

  const handleInitDefault = () => {
    Alert.alert(
      'Initialiser les tables',
      'Créer les tables 1 à 5 ? (Remplace la liste actuelle si elle existe)',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await setTablesList(DEFAULT_TABLES);
            } catch (err) {
              Alert.alert('Erreur', 'Impossible d\'initialiser');
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
      <View style={styles.actions}>
        <View style={styles.addBtn}>
          <Button
            title="+ Ajouter une table"
            onPress={() => setAddModalVisible(true)}
            fullWidth
          />
        </View>
        {tables.length === 0 && (
          <Button
            title="Initialiser (tables 1 à 5)"
            onPress={handleInitDefault}
            variant="outline"
          />
        )}
      </View>
      <Text style={styles.hint}>
        Les clients voient cette liste pour choisir leur table.
      </Text>
      <FlatList
        data={tables}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.tableName}>Table {item.name}</Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleRemoveTable(item)}
            >
              <Text style={styles.deleteBtnText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Aucune table. Ajoutez-en ou initialisez avec les tables 1 à 5.
          </Text>
        }
      />

      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nouvelle table</Text>
            <TextInput
              style={styles.input}
              value={newTableName}
              onChangeText={setNewTableName}
              placeholder="Nom (ex: 6, Terrasse, Bar)"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <View style={styles.modalBtn}>
                <Button
                  title="Annuler"
                  onPress={() => setAddModalVisible(false)}
                  variant="secondary"
                  fullWidth
                />
              </View>
              <View style={styles.modalBtn}>
                <Button
                  title="Ajouter"
                  onPress={handleAddTable}
                  loading={saving}
                  disabled={!newTableName.trim()}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  addBtn: { flex: 1, minWidth: 0 },
  hint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  tableName: { fontSize: 18, fontWeight: '600' },
  deleteBtn: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  deleteBtnText: { color: theme.colors.error, fontWeight: '600' },
  empty: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: theme.spacing.md },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  modalBtn: { flex: 1 },
});
