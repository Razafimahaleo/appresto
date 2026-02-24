import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import { useStaff } from '../contexts/StaffContext';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'RoleSelection'>;

function Logo() {
  return (
    <Image
      source={require('../../assets/logoCE.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  );
}

export default function RoleSelectionScreen() {
  const nav = useNavigation<NavProp>();
  const { clearStaff } = useStaff();

  useFocusEffect(
    useCallback(() => {
      clearStaff();
    }, [clearStaff])
  );

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo />
      </View>
      <Text style={styles.subtitle}>Choisissez votre interface</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => nav.navigate('Client')}
          activeOpacity={0.85}
        >
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.cardTitle}>Client</Text>
          <Text style={styles.cardDesc}>Menu et commande</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => nav.navigate('StaffPin', { role: 'chef' })}
          activeOpacity={0.85}
        >
          <Text style={styles.emoji}>👨‍🍳</Text>
          <Text style={styles.cardTitle}>Chef</Text>
          <Text style={styles.cardDesc}>Gérer les commandes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => nav.navigate('StaffPin', { role: 'cashier' })}
          activeOpacity={0.85}
        >
          <Text style={styles.emoji}>💳</Text>
          <Text style={styles.cardTitle}>Caissière</Text>
          <Text style={styles.cardDesc}>Menus et plats prêts</Text>
        </TouchableOpacity>
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
  logoContainer: {
    marginBottom: theme.spacing.md,
  },
  logo: {
    width: 180,
    height: 180,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoPlaceholderIcon: {
    fontSize: 56,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: 180,
    minWidth: 160,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  emoji: { fontSize: 48, marginBottom: theme.spacing.sm },
  cardTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  cardDesc: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
});
