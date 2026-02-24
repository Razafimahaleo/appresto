import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStaff } from '../../contexts/StaffContext';
import { theme } from '../../constants/theme';

/**
 * Badge pour le header : point vert + nom dans un cercle, en haut à droite.
 * N'affiche rien si aucun staff connecté.
 */
export default function StaffHeaderBadge() {
  const { currentStaff } = useStaff();

  if (!currentStaff) return null;

  return (
    <View style={styles.container}>
      <View style={styles.greenDot} />
      <View style={styles.circle}>
        <Text style={styles.name} numberOfLines={1}>
          {currentStaff.name.length <= 10 ? currentStaff.name : `${currentStaff.name.slice(0, 8)}…`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.xs,
  },
  circle: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
    maxWidth: 120,
  },
});
