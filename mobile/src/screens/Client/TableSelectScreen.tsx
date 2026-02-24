import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTable } from '../../contexts/TableContext';
import {
  subscribeToOrders,
  subscribeToTableLocks,
  subscribeToTablesList,
  setTableLock,
  getTableLock,
} from '../../services/firestore';
import type { ClientStackParamList } from '../../navigation/ClientNavigator';
import { theme } from '../../constants/theme';
import Button from '../../components/common/Button';
import type { TableItem } from '../../services/firestore';

type NavProp = NativeStackNavigationProp<ClientStackParamList, 'TableSelect'>;

const CODE_LENGTH = 4;
const TABLES_PER_PAGE = 5;

export default function TableSelectScreen() {
  const nav = useNavigation<NavProp>();
  const { setTable } = useTable();
  const [orders, setOrders] = useState<{ tableId: string; status: string }[]>([]);
  const [tableIdsWithLock, setTableIdsWithLock] = useState<Set<string>>(new Set());
  const [modalMode, setModalMode] = useState<'set' | 'enter' | null>(null);
  const [selectedTable, setSelectedTable] = useState<{ id: string; name: string } | null>(null);
  const [code, setCode] = useState('');
  const [codeConfirm, setCodeConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tables, setTables] = useState<TableItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(tables.length / TABLES_PER_PAGE));
  const paginatedTables =
    tables.length > TABLES_PER_PAGE
      ? tables.slice(
          currentPage * TABLES_PER_PAGE,
          (currentPage + 1) * TABLES_PER_PAGE
        )
      : tables;

  useEffect(() => {
    const unsubOrders = subscribeToOrders((data) => {
      setOrders(data.map((o) => ({ tableId: o.tableId, status: o.status })));
    });
    const unsubLocks = subscribeToTableLocks(setTableIdsWithLock);
    const unsubTables = subscribeToTablesList(setTables);
    return () => {
      unsubOrders();
      unsubLocks();
      unsubTables();
    };
  }, []);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [tables.length, totalPages, currentPage]);

  const tablesWithActiveOrder = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.status !== 'delivered') set.add(o.tableId);
    });
    return set;
  }, [orders]);

  const isOccupied = (tableId: string) =>
    tablesWithActiveOrder.has(tableId) || tableIdsWithLock.has(tableId);

  const goToMenu = (id: string, name: string) => {
    setTable(id, name);
    setModalMode(null);
    setSelectedTable(null);
    setCode('');
    setCodeConfirm('');
    setError('');
    nav.navigate('Menu');
  };

  const openSetCode = (id: string, name: string) => {
    setSelectedTable({ id, name });
    setModalMode('set');
    setCode('');
    setCodeConfirm('');
    setError('');
  };

  const openEnterCode = (id: string, name: string) => {
    setSelectedTable({ id, name });
    setModalMode('enter');
    setCode('');
    setError('');
  };

  const handleSetCode = async () => {
    if (!selectedTable) return;
    if (code.length !== CODE_LENGTH || !/^\d+$/.test(code)) {
      setError(`Code à ${CODE_LENGTH} chiffres`);
      return;
    }
    if (code !== codeConfirm) {
      setError('Les deux codes ne correspondent pas');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await setTableLock(selectedTable.id, code);
      goToMenu(selectedTable.id, selectedTable.name);
    } catch (e) {
      setError('Erreur, réessayez');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterCode = async () => {
    if (!selectedTable) return;
    if (code.length !== CODE_LENGTH || !/^\d+$/.test(code)) {
      setError(`Code à ${CODE_LENGTH} chiffres`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const savedCode = await getTableLock(selectedTable.id);
      if (savedCode === code) {
        goToMenu(selectedTable.id, selectedTable.name);
      } else {
        setError('Code incorrect');
      }
    } catch (e) {
      setError('Erreur, réessayez');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedTable(null);
    setCode('');
    setCodeConfirm('');
    setError('');
  };

  const onTablePress = (id: string, name: string) => {
    if (isOccupied(id)) {
      openEnterCode(id, name);
    } else {
      openSetCode(id, name);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sélectionnez votre table</Text>
      {tables.length === 0 ? (
        <Text style={styles.emptyTables}>
          Aucune table configurée. Demandez au personnel.
        </Text>
      ) : (
      <>
      <View style={styles.grid}>
        {paginatedTables.map((t) => {
          const occupied = isOccupied(t.id);
          return (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.tableBtn,
                occupied ? styles.tableBtnOccupied : styles.tableBtnFree,
              ]}
              onPress={() => onTablePress(t.id, t.name)}
              activeOpacity={0.7}
            >
              <Text style={styles.tableNum}>{t.name}</Text>
              <Text style={styles.tableStatus}>
                {occupied ? 'Occupée' : 'Libre'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {tables.length > TABLES_PER_PAGE && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, currentPage === 0 && styles.pageBtnDisabled]}
            onPress={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <Text style={styles.pageBtnText}>← Précédent</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>
            {currentPage + 1} / {totalPages}
          </Text>
          <TouchableOpacity
            style={[
              styles.pageBtn,
              currentPage >= totalPages - 1 && styles.pageBtnDisabled,
            ]}
            onPress={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage >= totalPages - 1}
          >
            <Text style={styles.pageBtnText}>Suivant →</Text>
          </TouchableOpacity>
        </View>
      )}
      </>
      )}

      <Modal
        visible={modalMode !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {modalMode === 'set'
                ? `Table ${selectedTable?.name} – Définir le code`
                : `Table ${selectedTable?.name} – Entrer le code`}
            </Text>
            <Text style={styles.modalHint}>
              {CODE_LENGTH} chiffres
            </Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="Code"
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              secureTextEntry
            />
            {modalMode === 'set' && (
              <TextInput
                style={styles.input}
                value={codeConfirm}
                onChangeText={setCodeConfirm}
                placeholder="Confirmer le code"
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                secureTextEntry
              />
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.modalButtons}>
              <View style={styles.modalBtn}>
                <Button
                  title="Annuler"
                  onPress={closeModal}
                  variant="secondary"
                  fullWidth
                />
              </View>
              <View style={styles.modalBtn}>
                <Button
                  title={modalMode === 'set' ? 'Valider' : 'Déverrouiller'}
                  onPress={modalMode === 'set' ? handleSetCode : handleEnterCode}
                  loading={loading}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: theme.spacing.xl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  tableBtn: {
    width: 100,
    minHeight: 90,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  tableBtnFree: {
    backgroundColor: theme.colors.primary,
  },
  tableBtnOccupied: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.7,
  },
  tableNum: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  tableStatus: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  emptyTables: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  pageBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pageInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  modalHint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: 18,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  modalBtn: { flex: 1 },
});
