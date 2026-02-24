import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../constants/theme';
import { getStaffProfiles, getStaffPin } from '../services/firestore';
import { useStaff } from '../contexts/StaffContext';
import type { RootStackParamList } from '../navigation/AppNavigator';

type RouteProps = RouteProp<RootStackParamList, 'StaffPin'>;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'StaffPin'>;

export default function StaffPinScreen() {
  const route = useRoute<RouteProps>();
  const nav = useNavigation<NavProp>();
  const { setCurrentStaff } = useStaff();
  const role = route.params?.role ?? 'chef';

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [profiles, setProfiles] = useState<{ id: string; name: string; pin: string; role: 'chef' | 'cashier' }[]>([]);
  const [fallbackPin, setFallbackPin] = useState('');

  useEffect(() => {
    Promise.all([getStaffProfiles(role), getStaffPin(role)])
      .then(([list, singlePin]) => {
        setProfiles(list);
        setFallbackPin(singlePin);
      })
      .catch(() => setFallbackPin('1234'))
      .finally(() => setLoading(false));
  }, [role]);

  const handleValidate = async () => {
    if (!pin.trim() || checking) return;
    setChecking(true);
    const entered = pin.trim();

    if (profiles.length > 0) {
      const match = profiles.find((p) => p.pin === entered);
      if (match) {
        setCurrentStaff({ id: match.id, name: match.name, role: match.role });
        if (role === 'chef') nav.replace('Chef');
        else nav.replace('Cashier');
      } else {
        Alert.alert('Code incorrect', 'Veuillez réessayer.');
        setPin('');
      }
    } else {
      if (entered === fallbackPin) {
        setCurrentStaff({ id: 'default', name: 'Staff', role });
        if (role === 'chef') nav.replace('Chef');
        else nav.replace('Cashier');
      } else {
        Alert.alert('Code incorrect', 'Veuillez réessayer.');
        setPin('');
      }
    }
    setChecking(false);
  };

  const title = role === 'chef' ? 'Accès Chef' : 'Accès Caissière';
  const subtitle = 'Entrez le code d\'accès';

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          placeholder="Code PIN"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          maxLength={8}
          secureTextEntry
          autoFocus
          editable={!checking}
        />
        <TouchableOpacity
          style={[styles.button, (!pin.trim() || checking) && styles.buttonDisabled]}
          onPress={handleValidate}
          disabled={!pin.trim() || checking}
          activeOpacity={0.8}
        >
          {checking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Valider</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => nav.goBack()}
          disabled={checking}
        >
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  box: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  backBtn: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
