import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CashierStackParamList } from '../../navigation/CashierNavigator';
import { theme } from '../../constants/theme';
import { ChatFab, ChatModal } from '../Shared/ChatScreen';
import { subscribeToOrders } from '../../services/firestore';
import { computeDailyStats } from '../../utils/dailyStats';
import type { Order } from '../../types';

type NavProp = NativeStackNavigationProp<CashierStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const nav = useNavigation<NavProp>();
  const [chatOpen, setChatOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    return subscribeToOrders(setOrders);
  }, []);

  const stats = useMemo(() => computeDailyStats(orders), [orders]);

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Statistiques du jour</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.revenue.toFixed(2)} €</Text>
            <Text style={styles.statLabel}>Chiffre d'affaires</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.orderCount}</Text>
            <Text style={styles.statLabel}>Commandes servies</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats.topDish ? `${stats.topDish.name} (${stats.topDish.quantity})` : '—'}
            </Text>
            <Text style={styles.statLabel}>Plat le plus vendu</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardsRow}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => nav.navigate('MenuManager')}
          activeOpacity={0.88}
        >
          <Text style={styles.emoji}>📋</Text>
          <Text style={styles.cardTitle}>Gestion des menus</Text>
          <Text style={styles.cardDesc}>CRUD, promotions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => nav.navigate('ReadyOrders')}
          activeOpacity={0.88}
        >
          <Text style={styles.emoji}>🔔</Text>
          <Text style={styles.cardTitle}>Plats prêts</Text>
          <Text style={styles.cardDesc}>À servir aux tables</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => nav.navigate('ReleaseTable')}
          activeOpacity={0.88}
        >
          <Text style={styles.emoji}>🪑</Text>
          <Text style={styles.cardTitle}>Libérer une table</Text>
          <Text style={styles.cardDesc}>Clients partis → table à nouveau libre</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => nav.navigate('TablesManager')}
          activeOpacity={0.88}
        >
          <Text style={styles.emoji}>⊞</Text>
          <Text style={styles.cardTitle}>Gestion des tables</Text>
          <Text style={styles.cardDesc}>Ajouter ou supprimer des tables</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      <ChatFab onPress={() => setChatOpen(true)} />
      <ChatModal
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
        sender="cashier"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  container: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  statsSection: {
    marginBottom: theme.spacing.xl,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
  card: {
    flex: 1,
    minWidth: 140,
    maxWidth: 220,
    marginBottom: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  emoji: { fontSize: 44, marginBottom: theme.spacing.sm },
  cardTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  cardDesc: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' },
});
