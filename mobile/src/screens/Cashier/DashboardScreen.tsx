import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CashierStackParamList } from '../../navigation/CashierNavigator';
import { theme } from '../../constants/theme';
import { ChatFab, ChatModal } from '../Shared/ChatScreen';

type NavProp = NativeStackNavigationProp<CashierStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const nav = useNavigation<NavProp>();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => nav.navigate('MenuManager')}
      >
        <Text style={styles.emoji}>📋</Text>
        <Text style={styles.cardTitle}>Gestion des menus</Text>
        <Text style={styles.cardDesc}>CRUD, promotions</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={() => nav.navigate('ReadyOrders')}
      >
        <Text style={styles.emoji}>🔔</Text>
        <Text style={styles.cardTitle}>Plats prêts</Text>
        <Text style={styles.cardDesc}>À servir aux tables</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={() => nav.navigate('ReleaseTable')}
      >
        <Text style={styles.emoji}>🪑</Text>
        <Text style={styles.cardTitle}>Libérer une table</Text>
        <Text style={styles.cardDesc}>Clients partis → table à nouveau libre</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={() => nav.navigate('TablesManager')}
      >
        <Text style={styles.emoji}>⊞</Text>
        <Text style={styles.cardTitle}>Gestion des tables</Text>
        <Text style={styles.cardDesc}>Ajouter ou supprimer des tables</Text>
      </TouchableOpacity>
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
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: { fontSize: 48, marginBottom: theme.spacing.md },
  cardTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
  cardDesc: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 8 },
});
