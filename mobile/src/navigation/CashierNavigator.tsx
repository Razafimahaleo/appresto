import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/Cashier/DashboardScreen';
import MenuManagerScreen from '../screens/Cashier/MenuManagerScreen';
import ReadyOrdersScreen from '../screens/Cashier/ReadyOrdersScreen';

export type CashierStackParamList = {
  Dashboard: undefined;
  MenuManager: undefined;
  ReadyOrders: undefined;
};

const Stack = createNativeStackNavigator<CashierStackParamList>();

export default function CashierNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Caissière' }}
      />
      <Stack.Screen
        name="MenuManager"
        component={MenuManagerScreen}
        options={{ title: 'Gestion des menus' }}
      />
      <Stack.Screen
        name="ReadyOrders"
        component={ReadyOrdersScreen}
        options={{ title: 'Plats prêts' }}
      />
    </Stack.Navigator>
  );
}
