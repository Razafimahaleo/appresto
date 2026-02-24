import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import StaffPinScreen from '../screens/StaffPinScreen';
import ClientNavigator from './ClientNavigator';
import ChefNavigator from './ChefNavigator';
import CashierNavigator from './CashierNavigator';

export type RootStackParamList = {
  RoleSelection: undefined;
  Client: undefined;
  StaffPin: { role: 'chef' | 'cashier' };
  Chef: undefined;
  Cashier: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="RoleSelection"
    >
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Client" component={ClientNavigator} />
      <Stack.Screen
        name="StaffPin"
        component={StaffPinScreen}
        options={{ title: 'Code d\'accès', headerShown: true }}
      />
      <Stack.Screen name="Chef" component={ChefNavigator} />
      <Stack.Screen name="Cashier" component={CashierNavigator} />
    </Stack.Navigator>
  );
}
