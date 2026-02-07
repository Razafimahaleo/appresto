import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTable } from '../../contexts/TableContext';
import type { ClientStackParamList } from '../../navigation/ClientNavigator';
import { theme } from '../../constants/theme';

type NavProp = NativeStackNavigationProp<ClientStackParamList, 'TableSelect'>;

const TABLES = [
  { id: '1', name: '1' },
  { id: '2', name: '2' },
  { id: '3', name: '3' },
  { id: '4', name: '4' },
  { id: '5', name: '5' },
];

export default function TableSelectScreen() {
  const nav = useNavigation<NavProp>();
  const { setTable } = useTable();

  const selectTable = (id: string, name: string) => {
    setTable(id, name);
    nav.navigate('Menu');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sélectionnez votre table</Text>
      <View style={styles.grid}>
        {TABLES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={styles.tableBtn}
            onPress={() => selectTable(t.id, t.name)}
          >
            <Text style={styles.tableNum}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableNum: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
});
