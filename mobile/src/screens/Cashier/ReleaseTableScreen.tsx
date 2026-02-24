import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  subscribeToTableLocks,
  subscribeToTablesList,
  clearTableLock,
} from '../../services/firestore';
import type { TableItem } from '../../services/firestore';
import { theme } from '../../constants/theme';

const TABLES_PER_PAGE = 5;

export default function ReleaseTableScreen() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [tableIdsWithLock, setTableIdsWithLock] = useState<Set<string>>(new Set());
  const [releasing, setReleasing] = useState<string | null>(null);
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
    const unsubTables = subscribeToTablesList(setTables);
    return unsubTables;
  }, []);
  useEffect(() => {
    return subscribeToTableLocks(setTableIdsWithLock);
  }, []);

  const handleRelease = async (tableId: string) => {
    setReleasing(tableId);
    try {
      await clearTableLock(tableId);
    } catch (err) {
      console.error('Libérer table failed:', err);
    } finally {
      setReleasing(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Libérer une table</Text>
      <Text style={styles.hint}>
        Cliquez sur « Libérer » quand les clients ont quitté la table. La table
        redevient sélectionnable par un nouveau client.
      </Text>
      {tables.length === 0 ? (
        <Text style={styles.empty}>Aucune table. Ajoutez-en dans Gestion des tables.</Text>
      ) : (
        <>
          <View style={styles.grid}>
            {paginatedTables.map((t) => {
              const hasLock = tableIdsWithLock.has(t.id);
              return (
                <View key={t.id} style={styles.tableCard}>
                  <Text style={styles.tableNum}>Table {t.name}</Text>
                  {hasLock ? (
                    <TouchableOpacity
                      style={styles.releaseBtn}
                      onPress={() => handleRelease(t.id)}
                      disabled={!!releasing}
                    >
                      {releasing === t.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.releaseBtnText}>Libérer</Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.freeLabel}>Libre</Text>
                  )}
                </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  hint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  tableCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  tableNum: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  releaseBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    minWidth: 100,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  releaseBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  freeLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  empty: {
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
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
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
});
